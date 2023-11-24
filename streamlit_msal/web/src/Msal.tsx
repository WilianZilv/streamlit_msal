import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib";
import React, { ReactNode } from "react";
import * as msal from "@azure/msal-browser";

interface Props {
  login: boolean;
  logout: boolean;
  revalidate: boolean;
  clientId: string;
  authority: string;
  scopes: string[];
}

let previousLogin = false;
let previousLogout = false;
let previousRevalidate = false;

const isDev = !window.location.href.includes("index.html");

let href = decodeURIComponent(window.location.href);
href = href.split("?").slice(0, -1).join("?");

const redirectUri = isDev ? href : "/";

const accountSelectRequest = (scopes: any[] = []) => ({
  scopes,
  prompt: "select_account",
});

const authorizeAccountRequest = (account: any, scopes: any[] = []) => ({
  scopes,
  account,
  prompt: "none",
});

function saveAuthData(clientId: string, authData: any, store: boolean = true) {
  let _str = JSON.stringify(authData);
  if (!store) return;
  localStorage.setItem(clientId, _str);
}

function retrieveAuthData(clientId: string) {
  const raw = localStorage.getItem(clientId);
  if (!raw) return null;
  return JSON.parse(raw);
}

class Component extends StreamlitComponentBase {
  public getClientId = () => {
    const { args } = this.props;
    const { clientId }: Props = args;

    return clientId;
  };

  public handleAuthenticationResult = (data: any) => {
    const clientId = this.getClientId();

    saveAuthData(clientId, data);
    Streamlit.setComponentValue({ data });
  };

  public handleAuthenticationError = (error: any) => {
    this.signOut();
  };

  public authenticate = async (
    clientId: string,
    authority: string,
    account: any = null,
    scopes: string[] = []
  ) => {
    sessionStorage.removeItem("msal.interaction.status");

    Streamlit.setComponentValue({ in_interaction: true });

    const client = new msal.PublicClientApplication({
      auth: {
        clientId,
        authority,
        redirectUri,
      },
    });

    await client.initialize();

    client
      .acquireTokenPopup(
        account
          ? authorizeAccountRequest(account, scopes)
          : accountSelectRequest(scopes)
      )
      .then(this.handleAuthenticationResult)
      .catch(this.handleAuthenticationError);
  };

  public signOut = () => {
    const clientId = this.getClientId();

    localStorage.removeItem(clientId);
    Streamlit.setComponentValue({ data: null });
  };

  public revalidate = () => {
    const { args } = this.props;
    const { clientId, authority, scopes }: Props = args;

    const authData = retrieveAuthData(clientId);
    if (authData === null) return Streamlit.setComponentValue({ data: null });

    this.authenticate(clientId, authority, authData.account, scopes);
  };

  public hideComponent = () => {
    if (isDev) return; // Doesn't work in dev mode

    const doc = window.parent.document;
    const root = doc.querySelector("div[id='root']");
    const msals = doc.querySelectorAll('iframe[title="streamlit_msal.msal"]');

    if (msals !== null && root !== null) {
      msals.forEach((msal) => {
        const msalParent = msal.parentElement;
        if (msalParent !== null) {
          msalParent.style.display = "none";
        }
      });
    }
  };

  public componentDidMount = () => {
    this.hideComponent();

    Streamlit.setComponentReady();

    const clientId = this.getClientId();

    const authData = retrieveAuthData(clientId);

    if (authData === null) return this.handleAuthenticationError(null);
    if (authData.expiresOn <= new Date()) return this.revalidate();

    this.handleAuthenticationResult(authData);
  };

  public render = (): ReactNode => {
    const { args } = this.props;
    const { login, logout, revalidate, clientId, authority, scopes }: Props =
      args;

    if (login && !previousLogin) {
      this.signOut();
      this.authenticate(clientId, authority, null, scopes);
    }
    previousLogin = login;

    if (logout && !previousLogout) {
      this.signOut();
    }
    previousLogout = logout;

    if (revalidate && !previousRevalidate) {
      this.revalidate();
    }
    previousRevalidate = revalidate;

    return null;
  };
}

export default withStreamlitConnection(Component);
