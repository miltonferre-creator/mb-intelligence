import os
import pathlib
import ssl
import sys


ROOT = pathlib.Path(__file__).resolve().parents[4]
API_ROOT = pathlib.Path(__file__).resolve().parents[2]
PACKAGE_DIR = API_ROOT / ".python-packages"

sys.path.insert(0, str(PACKAGE_DIR))

import pg8000.dbapi  # noqa: E402


def load_env(path):
    if not path.exists():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


def split_sql(sql):
    statements = []
    current = []
    in_single = False
    in_double = False
    dollar_tag = None
    i = 0

    while i < len(sql):
        ch = sql[i]
        nxt = sql[i + 1] if i + 1 < len(sql) else ""

        if dollar_tag:
          if sql.startswith(dollar_tag, i):
              current.append(dollar_tag)
              i += len(dollar_tag)
              dollar_tag = None
              continue
          current.append(ch)
          i += 1
          continue

        if not in_single and not in_double and ch == "$":
            end = sql.find("$", i + 1)
            if end != -1:
                tag = sql[i:end + 1]
                if tag == "$$" or tag[1:-1].replace("_", "").isalnum():
                    dollar_tag = tag
                    current.append(tag)
                    i = end + 1
                    continue

        if in_single:
            current.append(ch)
            if ch == "'" and nxt == "'":
                current.append(nxt)
                i += 2
                continue
            if ch == "'":
                in_single = False
            i += 1
            continue

        if in_double:
            current.append(ch)
            if ch == '"':
                in_double = False
            i += 1
            continue

        if ch == "'":
            in_single = True
            current.append(ch)
            i += 1
            continue

        if ch == '"':
            in_double = True
            current.append(ch)
            i += 1
            continue

        if ch == "-" and nxt == "-":
            end = sql.find("\n", i)
            if end == -1:
                break
            current.append(sql[i:end + 1])
            i = end + 1
            continue

        if ch == ";":
            statement = "".join(current).strip()
            if statement:
                statements.append(statement)
            current = []
            i += 1
            continue

        current.append(ch)
        i += 1

    statement = "".join(current).strip()
    if statement:
        statements.append(statement)
    return statements


def connect():
    ssl_context = ssl.create_default_context()
    if os.environ.get("SUPABASE_DB_SSL_VERIFY", "false").lower() != "true":
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE

    return pg8000.dbapi.connect(
        host=os.environ["SUPABASE_DB_HOST"],
        port=int(os.environ.get("SUPABASE_DB_PORT", "5432")),
        database=os.environ.get("SUPABASE_DB_NAME", "postgres"),
        user=os.environ.get("SUPABASE_DB_USER", "postgres"),
        password=os.environ["SUPABASE_DB_PASSWORD"],
        ssl_context=ssl_context,
        timeout=30,
    )


def apply_migration(connection, path):
    sql = path.read_text(encoding="utf-8")
    statements = split_sql(sql)
    cursor = connection.cursor()
    for index, statement in enumerate(statements, start=1):
        try:
            cursor.execute(statement)
        except Exception as exc:
            connection.rollback()
            raise RuntimeError(f"Falha em {path.name}, statement {index}: {exc}") from exc
    connection.commit()
    return len(statements)


def main():
    load_env(API_ROOT / ".env")
    migrations_dir = ROOT / "infra" / "supabase" / "migrations"
    migrations = sorted(migrations_dir.glob("*.sql"))
    if not migrations:
        raise RuntimeError("Nenhuma migration encontrada.")

    with connect() as connection:
        applied = []
        for migration in migrations:
            count = apply_migration(connection, migration)
            applied.append({"file": migration.name, "statements": count})

    print({"applied": applied})


if __name__ == "__main__":
    main()
