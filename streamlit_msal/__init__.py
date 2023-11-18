from dataclasses import dataclass
import os
from typing import Literal, Optional
import streamlit.components.v1 as components
import streamlit as st

_RELEASE = True


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


def msal(
    trigger_login: bool,
    trigger_logout: bool,
    client_id: str,
    authority: str,
    scopes=[],
    key=None,
):
    key = key or "streamlit_msal.msal"

    _component = declare_component("msal")

    value = _component(
        login=trigger_login,
        logout=trigger_logout,
        clientId=client_id,
        authority=authority,
        scopes=scopes,
        key=key,
    )

    if value is None:
        st.stop()

    return value["data"]
