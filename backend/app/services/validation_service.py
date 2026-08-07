import re

EMAIL_REGEX = r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"


def validate_contacts(df):

    if "Email" not in df.columns:
        raise ValueError("Excel must contain an Email column.")

    valid = []
    errors = []
    seen = set()

    for index, row in df.iterrows():

        email = str(row["Email"]).strip()

        if not re.match(EMAIL_REGEX, email):

            errors.append({
                "row": index + 2,
                "error": "Invalid Email"
            })

            continue

        if email.lower() in seen:

            errors.append({
                "row": index + 2,
                "error": "Duplicate Email"
            })

            continue

        seen.add(email.lower())

        valid.append({
            "email": email
        })

    return valid, errors