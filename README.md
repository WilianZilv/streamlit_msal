# streamlit-msal

Basic implementation of Microsoft Authentication Library (MSAL) for Streamlit

## Disclaimer

Please note that this library is intended solely for account validation to enable user access to the application. It does not cover all features of Microsoft Authentication Library (MSAL) and is not designed for handling access tokens beyond the initial authorization process.

The primary purpose of this library is to ensure that users pass the MSAL authorization process when accessing the application. It is not recommended for scenarios requiring full-featured or long-term token management.

## Application Configuration (Azure)

Create an App with OpenID Connect (OIDC) based sign-on

Add a Single-page application platform and configure a redirect URI.
http://localhost:8501 will work for Streamlit applications running locally.

## Integration Example

```py
import streamlit as st
from streamlit_msal import msal

do_login = st.button("Login")
do_logout = st.button("Logout")

client_id = "<client-id of your Application"
authority = "https://login.microsoftonline.com/<tenant id>"

account = msal(
    trigger_login=do_login,
    trigger_logout=do_logout,
    client_id=client_id,
    authority=authority,
    scopes=[] # Optional
)

if not account:
    st.write("Authentication required")
    st.stop()


name = account["name"]

st.write(f"Hello {name}!")
```
