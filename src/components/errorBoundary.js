import React from "react";
import { FaSkull } from "react-icons/fa";

class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, reported: false };
    }
    static getDerivedStateFromError(error) {
      return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
      //
    }
    render() {
      if (this.state.hasError) {
        return (
          <div className="deathPage">
            <div className="content">
              <FaSkull />
              <h2>Oops.</h2>
              <a href="/">RELOAD</a>
            </div>
          </div>
        );
      }
      return this.props.children;
    }
}

export default ErrorBoundary;