import mysql.connector
from mysql.connector import Error

def connect_to_db():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='chatting_with_emotion',
            user='root',
            password='0303' 
        )

        if connection.is_connected():
            db_info = connection.get_server_info()
            print(f"MySQL Server {db_info} successfully connected.")
            cursor = connection.cursor(dictionary=True)

            #INSERT/CREATE
            print("\n[CREATE] Creating new user 'sungwook7'...")
            insert_query = "INSERT INTO User (UserName, LoginID, LoginPW) VALUES (%s, %s, %s)"
            cursor.execute(insert_query, ('황성욱', 'sungwook7', 'password123'))
            connection.commit()

            #SELECT/READ
            print("\n[SELECT] Current user list:")
            cursor.execute("SELECT * FROM User")
            users = cursor.fetchall()
            for user in users:
                print(f"ID: {user['UserID']}, 이름: {user['UserName']}, Registration Date: {user['RegistrationDate']}")

            #UPDATE
            print("\n[UPDATE] Updating 'sungwook7' to 'sungwook8'...")
            update_query = "UPDATE User SET UserName = %s WHERE LoginID = %s"
            cursor.execute(update_query, ('sungwook8', 'sungwook7'))
            connection.commit()

            #DELETE/REMOVE
            print("\n[DELETE] Deleting...")
            delete_query = "DELETE FROM User WHERE LoginID = %s"
            cursor.execute(delete_query, ('sungwook7',))
            connection.commit()

            print("\nAll operations completed successfully.")

    except Error as e:
        print(f"Error occurred while connecting to MySQL: {e}")

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("\nMySQL connection closed.")

if __name__ == "__main__":
    connect_to_db()
