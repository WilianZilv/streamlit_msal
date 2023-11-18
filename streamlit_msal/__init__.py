import os
from typing import Literal, Optional
import streamlit.components.v1 as components
import streamlit as st
from streamlit import session_state as ss

_RELEASE = False


def declare_component(name: str):
    parent_dir = os.path.dirname(os.path.abspath(__file__))

    if not _RELEASE:
        with open(os.path.join(parent_dir, "web", ".env"), "r") as f:
            _env = f.readlines()
            port = [line for line in _env if line.startswith("PORT=")][0].split("=")[1]

        return components.declare_component(
            name,
            url=f"http://localhost:{port}",
        )

    build_dir = os.path.join(parent_dir, "web/build")
    return components.declare_component(name, path=build_dir)


action_key = "streamlit_msal.msal:action"


class Msal:
    @staticmethod
    def initialize(
        client_id: str,
        authority: str,
        scopes=[],
        key=None,
    ):
        key = key or "streamlit_msal.msal"

        action: Optional[Literal["login", "logout"]] = ss.get(action_key, None)

        trigger_login = action == "login"
        trigger_logout = action == "logout"
        revalidate = action == "revalidate"

        _component = declare_component("msal")

        value = _component(
            login=trigger_login,
            logout=trigger_logout,
            revalidate=revalidate,
            clientId=client_id,
            authority=authority,
            scopes=scopes,
            key=key,
        )

        if (value or {}).get("in_interaction", False):
            st.stop()

        if value is None:
            st.stop()

        ss[action_key] = None

        return value["data"]

    @staticmethod
    def sign_in():
        ss[action_key] = "login"
        st.rerun()

    @staticmethod
    def sign_out():
        ss[action_key] = "logout"
        st.rerun()

    @staticmethod
    def revalidate():
        ss[action_key] = "revalidate"
        st.rerun()

    @staticmethod
    def initialize_ui(
        client_id,
        authority,
        scopes=[],
        connecting_label="Connecting",
        disconnected_label="Disconnected",
        sign_in_label="Sign in",
        sign_out_label="Sign out",
    ):
        with st.status(connecting_label) as status:
            auth_data = Msal.initialize(
                client_id=client_id, authority=authority, scopes=scopes
            )

            is_authenticated = auth_data is not None

            if is_authenticated:
                name = auth_data["account"]["name"]
                status.update(label=name)
            else:
                status.update(label=disconnected_label, expanded=True, state="error")

            action = "login" if not is_authenticated else "logout"

            label_map = {
                "login": sign_in_label,
                "logout": sign_out_label,
            }

            do_action = st.button(label_map[action], use_container_width=True)

            action = action if do_action else None

            if action == "login":
                Msal.sign_in()

            if action == "logout":
                Msal.sign_out()

        return auth_data
