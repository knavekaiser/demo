import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Provider, IrDashboardContextProvider } from "./SiteContext";
import ErrorBoundary from './components/errorBoundary';

jest.mock("react-dom", () => ({ render: jest.fn() }));

describe("Application root", () => {
    const wrapper = (
        <React.StrictMode>
            <ErrorBoundary>
                <BrowserRouter>
                <Provider>
                    <IrDashboardContextProvider>
                    <App />
                    </IrDashboardContextProvider>
                </Provider>
                </BrowserRouter>
            </ErrorBoundary>
        </React.StrictMode>
    );
    it("should render without crashing", () => {
        const div = document.createElement("div");
        div.id = "root";
        document.body.appendChild(div);
        require("./index.js");
        expect(ReactDOM.render).toHaveBeenCalledWith(wrapper, div);
    });
});

