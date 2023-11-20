import streamlit as st

from streamlit_msal import Msal


def main():
    st.title("Hello World")

    if st.button("Login"):
        Msal.sign_in()
