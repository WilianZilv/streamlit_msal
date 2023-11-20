from uuid import uuid4
from streamlit_superapp import Navigation
from streamlit import session_state as ss
import streamlit as st
from streamlit_msal import Msal

# client_id = "<your-client-id>"
# authority = "https://login.microsoftonline.com/<your-tenant-id>"


def configure():
    auth_data = Msal.initialize(client_id=client_id, authority=authority)
    print("auth_data", not not auth_data)
    if not auth_data:
        ss["account"] = None
        ss["session_id"] = "0"

    if auth_data:
        ss["account"] = auth_data["account"]
        ss["session_id"] = ss["account"]["localAccountId"]

    account = ss.get("account", None)

    if account is not None:
        with st.sidebar:
            with st.status(label=account["name"]):
                if st.button("Sair", use_container_width=True):
                    Msal.sign_out()
