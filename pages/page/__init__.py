import streamlit as st
from streamlit_superapp import State


def main():
    st.title("Hello World")

    text = State("text", "Hello World")

    text.bind(st.text_input("Text", text.initial_value))
