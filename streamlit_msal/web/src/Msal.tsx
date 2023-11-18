import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib";
import React, { Fragment, ReactNode, useEffect, useState } from "react";
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

const KEY = "2KZVfd69U79m4kJ3htKg89";
const isDev = !window.location.href.includes("index.html");
const redirectUri = isDev ? window.location.href : "/";

const accountSelectRequest = (scopes: any[] = []) => ({
  scopes,
  prompt: "select_account",
  redirectUri,
});

const authorizeAccountRequest = (account: any, scopes: any[] = []) => ({
  scopes,
  account,
  prompt: "none",
  redirectUri,
});

function saveAccount(account: any, store: boolean = true) {
  let _str = JSON.stringify(account);

  if (!store) return;
  localStorage.setItem(KEY, _str);
}

function retrieveAccount() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  return JSON.parse(raw);
}

class Component extends StreamlitComponentBase {
  public handleAuthenticationResult = (data: any) => {
    saveAccount(data.account);
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
    const client = new msal.PublicClientApplication({
      auth: {
        clientId,
        authority,
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
    localStorage.removeItem(KEY);
    Streamlit.setComponentValue({ data: null });
  };

  public componentDidMount = () => {
    const account = retrieveAccount();
    if (account === null) return Streamlit.setComponentValue({ data: null });

    const { args } = this.props;
    const { clientId, authority, scopes }: Props = args;

    this.authenticate(clientId, authority, account, scopes);
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
      const account = retrieveAccount();
      if (account === null) return Streamlit.setComponentValue({ data: null });
      this.authenticate(clientId, authority, account, scopes);
    }
    previousRevalidate = revalidate;

    return null;
  };
}

export default withStreamlitConnection(Component);
