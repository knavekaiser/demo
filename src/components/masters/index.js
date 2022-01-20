import { Routes, Route } from "react-router-dom";
import Locations from "./location";
import Department from "./department";
import Categories from "./categories";
import PersonAffected from "./personAffected";
import UserMaster from "./userMaster";
import RiskAssessments from "./ram";
import TwoFieldMaster from "./twoFieldMaster";
import ContributingFactor from "./contributingFactor";
import IrCodeConfig from "./irCodeConfig";
import paths from "../path";
import Rca from "./rca";

export default function Masters() {
  return (
    <Routes>
      <Route path={paths.masters.location} element={<Locations />} />
      <Route path={paths.masters.department} element={<Department />} />
      <Route path={paths.masters.category} element={<Categories />} />
      <Route path={paths.masters.userMaster} element={<UserMaster />} />
      <Route
        path={paths.masters.riskAssessment}
        element={<RiskAssessments />}
      />
      <Route path={paths.masters.personAffected} element={<PersonAffected />} />
      <Route path={paths.masters.twoFieldMaster} element={<TwoFieldMaster />} />
      <Route
        path={paths.masters.contributingFactor}
        element={<ContributingFactor />}
      />
      <Route path={paths.masters.rca} element={<Rca />} />
      <Route path={paths.masters.irCodeConfig} element={<IrCodeConfig />} />
      <Route path="/*" element={<h4 data-testid="masters">404</h4>} />
    </Routes>
  );
}
