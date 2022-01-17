import { Routes, Route } from "react-router-dom";
import MainConfig from "./mainConfiguration";
import UserPermission from "./userPermission";
import IrDataAnalytics from "./irDataAnalytics";
import paths from "../path";

export default function IrConfig() {
  return (
    <Routes>
      <Route path={paths.irConfig.mainConfig} element={<MainConfig />} />
      <Route
        path={paths.irConfig.userPermission}
        element={<UserPermission />}
      />
      <Route
        path={paths.irConfig.irDataAnalytics}
        element={<IrDataAnalytics />}
      />
    </Routes>
  );
}
