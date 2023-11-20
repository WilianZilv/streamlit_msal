import streamlit_superapp as app
import auth

auth.configure()

app.run(
    hide_back_button=True,
    hide_home_button=True,
)
