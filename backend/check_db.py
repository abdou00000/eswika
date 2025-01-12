import sqlite3

# Connect to the database
conn = sqlite3.connect('instance/legumes.db')
cursor = conn.cursor()

# List all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("Tables:", tables)

print("################################################################")
print("USER TABLE:")
print("################################################################")

# Query data from the User table
cursor.execute("SELECT * FROM User")
rows = cursor.fetchall()

if rows:
    for row in rows:
        print(row)
else:
    print("No data found in the User table.")

print("################################################################")
print("ORDER TABLE:")
print("################################################################")

# Query data from the Order table
cursor.execute("SELECT * FROM [order]")
rows = cursor.fetchall()

if rows:
    for row in rows:
        print(row)
else:
    print("No data found in the User table.")

print("################################################################")
print("PRODUCT TABLE:")
print("################################################################")
# Query data from the Product table
cursor.execute("SELECT * FROM Product")
rows = cursor.fetchall()

if rows:
    for row in rows:
        print(row)
else:
    print("No data found in the User table.")

print("################################################################")
print("Admin TABLE:")
print("################################################################")
# Query data from the Admin table
cursor.execute("SELECT * FROM Admin")
rows = cursor.fetchall()

if rows:
    for row in rows:
        print(row)
else:
    print("No data found in the User table.")


# Close the connection
conn.close()
