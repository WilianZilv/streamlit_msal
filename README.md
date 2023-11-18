# streamlit-msal

Basic implementation of Microsoft Authentication Library (MSAL) for Streamlit

## Disclaimer

This library is designed with simplicity and user-friendliness in mind, and as such, it may not encompass all possible functionalities. It primarily relies on pop-up windows for sign-in and revalidation of authentication processes.

While this approach provides a straightforward user experience, it may not be suitable for all use cases, especially those requiring more complex or robust authentication workflows. Please consider your specific requirements when deciding to use this library.

## Application Configuration (Azure)

Create an App with OpenID Connect (OIDC) based sign-on

Add a Single-page application platform and configure a redirect URI.
http://localhost:8501 will work for Streamlit applications running locally.

## Required information:

```py
client_id = "<Application (client) ID>"
authority = "https://login.microsoftonline.com/<Directory (tenant) ID>"
```

## UI Example (Easiest way)

This example uses "initialize_ui", that provides a UI with the core functionality in a simple but beautiful way.

```py
import streamlit as st
from streamlit_msal import Msal

with st.sidebar:
    auth_data = Msal.initialize_ui(
        client_id=client_id,
        authority=authority,
        scopes=[], # Optional
        # Customize (Default values):
        connecting_label="Connecting",
        disconnected_label="Disconnected",
        sign_in_label="Sign in",
        sign_out_label="Sign out"
    )

if not auth_data:
    st.write("Authenticate to access protected content")
    st.stop()

st.write("Protected content available")
```

## Headless example (Build your UI)

This example uses "initialize", that doesn't provide a UI so you can create your own.

```py
from streamlit_msal import Msal

auth_data = Msal.initialize(
    client_id=client_id,
    authority=authority,
    scopes=[],
)

if st.button("Sign in"):
    Msal.sign_in() # Show popup to select account

if st.button("Sign out"):
    Msal.sign_out() # Clears auth_data

if st.button("Revalidate"):
    Msal.revalidate() # Usefull to refresh "accessToken"
```

## Accessing result value

```py
# Getting usefull information
access_token = auth_data["accessToken"]

account = auth_data["account"]
name = account["name"]
username = account["username"]
account_id = account["localAccountId"]


# Display information
st.write(f"Hello {name}!")
st.write(f"Your username is: {username}")
st.write(f"Your account id is: {account_id}")
st.write("Your access token is:")
st.code(access_token)

st.write("Auth data:")
st.json(auth_data)
```
