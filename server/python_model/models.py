# from mongoengine import Document, StringField

# class User(Document):
#     email = StringField(required=True, unique=True)
#     hashed_password = StringField(required=True)
#     name = StringField()

#     meta = {
#         'collection': 'Collection1'  # This ensures users go in Collection1!
#     }
# user = User(email="test@now.com", hashed_password="abc", name="Test").save()
# print("User created:", user.id)
