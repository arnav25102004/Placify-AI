import json
import time
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import (
    MetaData,
    Table,
    column,
    delete,
    insert,
    inspect,
    select,
    table,
    text,
    update,
)

from app.auth_utils import get_password_hash
from app.database import engine
from app.dependencies.auth import get_current_admin
from app.logging_config import get_logger

logger = get_logger("placify.dev_db")
router = APIRouter(
    prefix="/api/v1/dev/db",
    tags=["dev_db"],
    dependencies=[Depends(get_current_admin)],
)


class QueryRequest(BaseModel):
    query: str
    params: Optional[Dict[str, Any]] = None


class InsertRowRequest(BaseModel):
    data: Optional[Dict[str, Any]] = None
    rows: Optional[List[Dict[str, Any]]] = None
    auto_hash_passwords: bool = True


class UpdateRowRequest(BaseModel):
    primary_key: Dict[str, Any]
    data: Dict[str, Any]
    auto_hash_passwords: bool = True


class DeleteRowRequest(BaseModel):
    primary_key: Dict[str, Any]


class SeedPresetRequest(BaseModel):
    preset: str


def _get_reflected_table(table_name: str) -> Table:
    meta = MetaData()
    try:
        meta.reflect(bind=engine, only=[table_name])
        if table_name not in meta.tables:
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' does not exist.")
        return meta.tables[table_name]
    except Exception as exc:
        if isinstance(exc, HTTPException):
            raise exc
        raise HTTPException(status_code=400, detail=f"Failed to reflect table '{table_name}': {str(exc)}")


def _format_value(val: Any) -> Any:
    """Safely format values for JSON responses (e.g. datetime, bytes)."""
    if val is None:
        return None
    if hasattr(val, "isoformat"):
        return val.isoformat()
    if isinstance(val, bytes):
        try:
            return val.decode("utf-8")
        except Exception:
            return f"<bytes len={len(val)}>"
    return val


@router.get("/tables")
def get_tables():
    """Returns a list of all tables in the connected database with schema details and row counts."""
    inspector = inspect(engine)
    table_names = inspector.get_table_names()
    tables_info = []

    with engine.connect() as conn:
        for t_name in table_names:
            try:
                cols_meta = inspector.get_columns(t_name)
                pk_constraint = inspector.get_pk_constraint(t_name)
                primary_keys = pk_constraint.get("constrained_columns", []) if pk_constraint else []

                # Fetch row count
                try:
                    count_res = conn.execute(text(f'SELECT COUNT(*) FROM "{t_name}"')).scalar()
                except Exception:
                    count_res = 0

                columns = []
                for c in cols_meta:
                    columns.append({
                        "name": c["name"],
                        "type": str(c["type"]),
                        "nullable": bool(c.get("nullable", True)),
                        "default": str(c.get("default")) if c.get("default") is not None else None,
                        "primary_key": c["name"] in primary_keys,
                    })

                tables_info.append({
                    "name": t_name,
                    "row_count": count_res,
                    "primary_keys": primary_keys,
                    "column_count": len(columns),
                    "columns": columns,
                })
            except Exception as e:
                logger.warning(f"Error inspecting table {t_name}: {e}")
                tables_info.append({
                    "name": t_name,
                    "row_count": 0,
                    "primary_keys": [],
                    "column_count": 0,
                    "columns": [],
                    "error": str(e),
                })

    return {"tables": tables_info, "dialect": engine.dialect.name}


@router.get("/tables/{table_name}/rows")
def get_table_rows(
    table_name: str,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    sort_by: Optional[str] = None,
    sort_dir: str = Query("asc", pattern="^(asc|desc)$"),
    search: Optional[str] = None,
):
    """Returns paginated rows from table_name with optional text search and sorting."""
    inspector = inspect(engine)
    if table_name not in inspector.get_table_names():
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found.")

    tbl = _get_reflected_table(table_name)

    with engine.connect() as conn:
        query = select(tbl)

        # Basic text search across text/string columns if provided
        if search and search.strip():
            s_term = f"%{search.strip()}%"
            text_conditions = []
            for col in tbl.columns:
                col_type = str(col.type).lower()
                if "char" in col_type or "text" in col_type or "string" in col_type:
                    text_conditions.append(col.ilike(s_term))
            if text_conditions:
                from sqlalchemy import or_
                query = query.where(or_(*text_conditions))

        # Total matching count
        count_query = select(text("COUNT(*)")).select_from(query.alias("subq"))
        try:
            total_count = conn.execute(count_query).scalar() or 0
        except Exception:
            total_count = 0

        # Sorting
        if sort_by and sort_by in tbl.columns:
            sort_col = tbl.columns[sort_by]
            query = query.order_by(sort_col.desc() if sort_dir == "desc" else sort_col.asc())
        elif tbl.primary_key.columns:
            first_pk = list(tbl.primary_key.columns)[0]
            query = query.order_by(first_pk.desc() if sort_dir == "desc" else first_pk.asc())

        # Pagination
        query = query.limit(limit).offset(offset)
        result = conn.execute(query)

        columns = [c.name for c in tbl.columns]
        rows = []
        for row in result:
            row_dict = {}
            for col_name, val in zip(columns, row):
                row_dict[col_name] = _format_value(val)
            rows.append(row_dict)

        return {
            "table": table_name,
            "columns": columns,
            "total_count": total_count,
            "limit": limit,
            "offset": offset,
            "rows": rows,
        }


@router.post("/tables/{table_name}/rows")
def insert_table_rows(table_name: str, payload: InsertRowRequest):
    """Inserts single or multiple rows into table_name."""
    tbl = _get_reflected_table(table_name)

    rows_to_insert = []
    if payload.data:
        rows_to_insert.append(payload.data)
    if payload.rows:
        rows_to_insert.extend(payload.rows)

    if not rows_to_insert:
        raise HTTPException(status_code=400, detail="Must provide either 'data' (single row) or 'rows' (array of rows).")

    sanitized_rows = []
    for r in rows_to_insert:
        row_copy = dict(r)
        # Handle plain password alias for users table
        if table_name == "users" and payload.auto_hash_passwords:
            if "password" in row_copy and "password_hash" not in row_copy:
                row_copy["password_hash"] = get_password_hash(str(row_copy.pop("password")))

        clean_row = {}
        for col_name, val in row_copy.items():
            if col_name in tbl.columns:
                # If password_hash is passed as raw string not starting with $2b$, hash it
                if table_name == "users" and payload.auto_hash_passwords and col_name == "password_hash":
                    if val and not str(val).startswith("$2b$"):
                        val = get_password_hash(str(val))
                # If json/dict provided for string/text column, serialize it
                if isinstance(val, (dict, list)):
                    col_type = str(tbl.columns[col_name].type).lower()
                    if "text" in col_type or "char" in col_type:
                        val = json.dumps(val)
                clean_row[col_name] = val
        if clean_row:
            sanitized_rows.append(clean_row)

    if not sanitized_rows:
        raise HTTPException(status_code=400, detail="No matching columns found in payload to insert.")

    inserted_results = []
    with engine.begin() as conn:
        for row_dict in sanitized_rows:
            try:
                stmt = insert(tbl).values(**row_dict)
                res = conn.execute(stmt)
                inserted_results.append({
                    "inserted": True,
                    "row": {k: _format_value(v) for k, v in row_dict.items()},
                    "lastrowid": getattr(res, "lastrowid", None),
                })
            except Exception as e:
                logger.error(f"Insert error in table '{table_name}': {e}", exc_info=True)
                raise HTTPException(status_code=400, detail=f"Database insert error: {str(e)}")

    logger.info(f"DevDB: Inserted {len(inserted_results)} rows into table '{table_name}'")
    return {
        "status": "success",
        "table": table_name,
        "inserted_count": len(inserted_results),
        "results": inserted_results,
    }


@router.put("/tables/{table_name}/rows")
def update_table_row(table_name: str, payload: UpdateRowRequest):
    """Updates a row in table_name matching the primary_key condition."""
    tbl = _get_reflected_table(table_name)

    if not payload.primary_key:
        raise HTTPException(status_code=400, detail="primary_key dictionary required to identify row.")

    conditions = []
    for pk_col, pk_val in payload.primary_key.items():
        if pk_col in tbl.columns:
            conditions.append(tbl.columns[pk_col] == pk_val)
        else:
            raise HTTPException(status_code=400, detail=f"Primary key column '{pk_col}' does not exist in table.")

    clean_data = {}
    for col_name, val in payload.data.items():
        if col_name in tbl.columns and col_name not in payload.primary_key:
            if table_name == "users" and payload.auto_hash_passwords:
                if col_name == "password_hash" and val and not str(val).startswith("$2b$"):
                    val = get_password_hash(str(val))
                elif col_name == "password":
                    clean_data["password_hash"] = get_password_hash(str(val))
                    continue
            if isinstance(val, (dict, list)):
                col_type = str(tbl.columns[col_name].type).lower()
                if "text" in col_type or "char" in col_type:
                    val = json.dumps(val)
            clean_data[col_name] = val

    if not clean_data:
        raise HTTPException(status_code=400, detail="No valid columns provided to update.")

    from sqlalchemy import and_
    with engine.begin() as conn:
        stmt = update(tbl).where(and_(*conditions)).values(**clean_data)
        res = conn.execute(stmt)
        if res.rowcount == 0:
            raise HTTPException(status_code=404, detail="No matching row found to update.")

    return {
        "status": "success",
        "table": table_name,
        "rows_updated": res.rowcount,
        "updated_fields": list(clean_data.keys()),
    }


@router.delete("/tables/{table_name}/rows")
def delete_table_row(
    table_name: str,
    payload: Optional[DeleteRowRequest] = None,
    pk_col: Optional[str] = None,
    pk_val: Optional[str] = None,
):
    """Deletes a row from table_name matching the given primary key."""
    tbl = _get_reflected_table(table_name)

    pk_dict = {}
    if payload and payload.primary_key:
        pk_dict = payload.primary_key
    elif pk_col and pk_val is not None:
        pk_dict = {pk_col: pk_val}

    if not pk_dict:
        raise HTTPException(status_code=400, detail="primary_key or pk_col/pk_val required to identify row to delete.")

    conditions = []
    for col_name, val in pk_dict.items():
        if col_name in tbl.columns:
            col_type = str(tbl.columns[col_name].type).lower()
            if "int" in col_type and str(val).isdigit():
                val = int(val)
            conditions.append(tbl.columns[col_name] == val)
        else:
            raise HTTPException(status_code=400, detail=f"Column '{col_name}' does not exist.")

    from sqlalchemy import and_
    with engine.begin() as conn:
        stmt = delete(tbl).where(and_(*conditions))
        res = conn.execute(stmt)
        if res.rowcount == 0:
            raise HTTPException(status_code=404, detail="No matching row found to delete.")

    return {
        "status": "success",
        "table": table_name,
        "rows_deleted": res.rowcount,
    }


@router.post("/tables/{table_name}/delete-row")
def delete_table_row_post(table_name: str, payload: DeleteRowRequest):
    """POST alternative to delete a row for HTTP clients with limited DELETE body support."""
    return delete_table_row(table_name, payload=payload)


@router.post("/tables/{table_name}/truncate")
def truncate_table(table_name: str):
    """Truncates or deletes all rows from the specified table."""
    _get_reflected_table(table_name)

    with engine.begin() as conn:
        try:
            if engine.dialect.name == "sqlite":
                conn.execute(text(f'DELETE FROM "{table_name}"'))
            else:
                conn.execute(text(f'TRUNCATE TABLE "{table_name}" CASCADE'))
        except Exception as e:
            conn.execute(text(f'DELETE FROM "{table_name}"'))

    logger.warning(f"DevDB: Truncated table '{table_name}'")
    return {"status": "success", "message": f"Table '{table_name}' cleared successfully."}


@router.post("/query")
def execute_custom_sql(payload: QueryRequest):
    """Executes arbitrary SQL query for testing and data manipulation."""
    sql_str = payload.query.strip()
    if not sql_str:
        raise HTTPException(status_code=400, detail="Query string cannot be empty.")

    start_time = time.time()
    params = payload.params or {}

    try:
        # Determine if statement returns rows
        is_select = sql_str.lstrip().lower().startswith(("select", "pragma", "explain", "show", "desc"))

        if is_select:
            with engine.connect() as conn:
                res = conn.execute(text(sql_str), params)
                columns = list(res.keys()) if res.returns_rows else []
                rows = []
                for row in res.fetchmany(500):  # Cap to 500 rows for UI safety
                    rows.append([_format_value(v) for v in row])
                duration_ms = round((time.time() - start_time) * 1000, 2)
                return {
                    "status": "success",
                    "type": "select",
                    "columns": columns,
                    "rows": rows,
                    "row_count": len(rows),
                    "execution_time_ms": duration_ms,
                }
        else:
            with engine.begin() as conn:
                res = conn.execute(text(sql_str), params)
                rows_affected = res.rowcount if hasattr(res, "rowcount") else -1
                duration_ms = round((time.time() - start_time) * 1000, 2)
                return {
                    "status": "success",
                    "type": "dml_ddl",
                    "rows_affected": rows_affected,
                    "execution_time_ms": duration_ms,
                    "message": f"Query executed successfully ({rows_affected} rows affected).",
                }
    except Exception as exc:
        duration_ms = round((time.time() - start_time) * 1000, 2)
        logger.error(f"SQL execution error: {exc}", exc_info=True)
        raise HTTPException(
            status_code=400,
            detail={
                "error": str(exc),
                "execution_time_ms": duration_ms,
                "query": sql_str,
            }
        )


@router.post("/seed-preset")
def seed_test_preset(payload: SeedPresetRequest):
    """Generates rapid test data presets directly into the database."""
    preset = payload.preset.lower()
    from app.seed import seed_db
    from app.models.user import User
    from app.models.batch import Batch
    from app.models.document import Document
    from app.models.extraction import Extraction
    from app.models.senior import Senior
    from app.models.company import Company
    from app.database import SessionLocal

    db = SessionLocal()
    try:
        if preset in ("all", "all_demo_data"):
            seed_db()
            # Also seed seniors and companies into DB if empty
            if db.query(Senior).count() == 0:
                _seed_initial_seniors(db)
            if db.query(Company).count() == 0:
                _seed_initial_companies(db)
            return {"status": "success", "message": "Full demo database initialized and verified."}

        elif preset in ("seniors", "sample_seniors"):
            count = _seed_initial_seniors(db)
            return {"status": "success", "message": f"Seeded {count} senior records."}

        elif preset in ("companies", "sample_companies"):
            count = _seed_initial_companies(db)
            return {"status": "success", "message": f"Seeded {count} recruiting companies."}

        elif preset in ("students", "sample_students"):
            count = _seed_sample_students(db)
            return {"status": "success", "message": f"Seeded {count} test student accounts."}

        elif preset in ("documents", "sample_documents"):
            count = _seed_sample_documents(db)
            return {"status": "success", "message": f"Seeded {count} verification documents and extractions."}

        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown preset '{payload.preset}'. Available presets: 'all', 'sample_students', 'sample_seniors', 'sample_companies', 'sample_documents'."
            )
    finally:
        db.close()


def _seed_initial_seniors(db) -> int:
    from app.models.senior import Senior
    from app.routers.student import _INITIAL_SENIORS
    count = 0
    for s_data in _INITIAL_SENIORS:
        existing = db.query(Senior).filter(Senior.name == s_data["name"], Senior.company == s_data["company"]).first()
        if not existing:
            senior = Senior(
                name=s_data["name"],
                batch=s_data["batch"],
                department=s_data["department"],
                company=s_data["company"],
                role=s_data["role"],
                package_lpa=s_data["package_lpa"],
                offer_type=s_data.get("offer_type", "Full-Time"),
                skills=json.dumps(s_data.get("skills", [])),
                interview_experience=s_data.get("interview_experience", ""),
                linkedin_url=s_data.get("linkedin_url", ""),
                email=s_data.get("email", ""),
                referral_status=s_data.get("referral_status", "Available"),
                campus=s_data.get("campus", "Bangalore Main Campus"),
            )
            db.add(senior)
            count += 1
    db.commit()
    return count


def _seed_initial_companies(db) -> int:
    from app.models.company import Company
    from app.routers.student import _INITIAL_COMPANIES
    count = 0
    for c_data in _INITIAL_COMPANIES:
        existing = db.query(Company).filter(Company.name == c_data["name"]).first()
        if not existing:
            company = Company(
                name=c_data["name"],
                industry=c_data["industry"],
                tier=c_data["tier"],
                avg_package_lpa=c_data["avg_package_lpa"],
                highest_package_lpa=c_data["highest_package_lpa"],
                total_offers=c_data["total_offers"],
                years_visited=json.dumps(c_data.get("years_visited", [])),
                roles=json.dumps(c_data.get("roles", [])),
                selection_process=json.dumps(c_data.get("selection_process", [])),
                eligibility=c_data.get("eligibility", ""),
                website=c_data.get("website", ""),
            )
            db.add(company)
            count += 1
    db.commit()
    return count


def _seed_sample_students(db) -> int:
    from app.models.user import User
    students_data = [
        ("Aarav Sharma", "aarav.sharma@placify.ai", "student123", "Computer Science", "CS2101", 9.1),
        ("Diya Menon", "diya.menon@placify.ai", "student123", "Information Technology", "IT2142", 8.8),
        ("Kavya Patel", "kavya.patel@placify.ai", "student123", "Computer Science & AI", "AI2115", 9.4),
        ("Nikhil Reddy", "nikhil.reddy@placify.ai", "student123", "Electronics & Comm", "EC2130", 8.2),
        ("Sneha Iyer", "sneha.iyer@placify.ai", "student123", "Data Science", "DS2108", 8.9),
    ]
    count = 0
    for name, email, pwd, dept, usn, cgpa in students_data:
        existing = db.query(User).filter(User.email == email).first()
        if not existing:
            user = User(
                email=email,
                password_hash=get_password_hash(pwd),
                role="student",
                campus_id=1,
                full_name=name,
                department=dept,
                bio=f"USN: {usn} • CGPA: {cgpa} • Final Year B.Tech",
            )
            db.add(user)
            count += 1
    db.commit()
    return count


def _seed_sample_documents(db) -> int:
    from app.models.batch import Batch
    from app.models.document import Document
    from app.models.extraction import Extraction

    # Ensure at least one batch
    batch = db.query(Batch).first()
    if not batch:
        batch = Batch(teacher_id=1, campus_id=1, file_count=3, status="processed")
        db.add(batch)
        db.commit()
        db.refresh(batch)

    doc_samples = [
        ("Arjun Kumar", "Google India", 32.0, "Software Engineer", "approved", "https://drive.google.com/open?id=test_google_offer"),
        ("Bhavya Roy", "Amazon AWS", 28.5, "Cloud Support Engineer", "approved", "https://drive.google.com/open?id=test_amazon_offer"),
        ("Chirag Sen", "Microsoft R&D", 26.0, "Software Development Engineer", "flagged", "https://drive.google.com/open?id=test_ms_offer"),
        ("Devika Nair", "Goldman Sachs", 24.0, "Summer Analyst", "pending", "https://drive.google.com/open?id=test_gs_offer"),
    ]

    count = 0
    for s_name, company, pkg, role, status, link in doc_samples:
        import hashlib
        f_hash = hashlib.sha256(f"{s_name}_{company}_{pkg}".encode()).hexdigest()
        existing = db.query(Document).filter(Document.file_hash == f_hash).first()
        if not existing:
            doc = Document(
                batch_id=batch.id,
                drive_file_id=f"test_drive_{count}",
                drive_view_link=link,
                file_hash=f_hash,
                status=status,
                submission_source="test_dev_seed",
            )
            db.add(doc)
            db.commit()
            db.refresh(doc)

            ext = Extraction(
                document_id=doc.id,
                student_name=s_name,
                company=company,
                package=pkg,
                role=role,
                confidence=0.96 if status == "approved" else 0.72,
            )
            db.add(ext)
            count += 1
    db.commit()
    return count
