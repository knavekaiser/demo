import { useEffect } from "react";
import IrInputs from "./irInput";
import IrDetails from "./irDetails";
import Rca from "./rca";
import { Tabs } from "../../elements";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { paths } from "../../../config";
import s from "./style.module.scss";

const Investigation = ({}) => {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (
      location.pathname.endsWith(
        paths.incidentDashboard.irInvestigation.investigation.basePath
      )
    ) {
      navigate(paths.incidentDashboard.irInvestigation.investigation.irInput);
    }
  }, []);
  return (
    <div className={s.mainContainer}>
      <Tabs
        tertiary
        tabs={[
          {
            label: "IR Input",
            path: paths.incidentDashboard.irInvestigation.investigation.irInput,
          },
          {
            label: "IR Details",
            path: paths.incidentDashboard.irInvestigation.investigation
              .irDetails,
          },
          {
            label: "IR Root Cause Analysis",
            path: paths.incidentDashboard.irInvestigation.investigation.irRca,
          },
        ]}
      />
      <Routes>
        <Route
          path={paths.incidentDashboard.irInvestigation.investigation.irInput}
          element={<IrInputs />}
        />
        <Route
          path={paths.incidentDashboard.irInvestigation.investigation.irDetails}
          element={<IrDetails />}
        />
        <Route
          path={paths.incidentDashboard.irInvestigation.investigation.irRca}
          element={<Rca />}
        />
      </Routes>
    </div>
  );
};

export default Investigation;
