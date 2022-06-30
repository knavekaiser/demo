import {
  CapaIcon,
  IncidentDashboardIcon,
  IncidentReportIcon,
  IrConfigIcon,
  MastersIcon,
  ReportsIcon,
} from "./svgs";
import { render } from "@testing-library/react";

const testIcon = (name, icon) => {
  test(name, () => {
    render(icon);
    const svg = document.querySelector("svg");
    expect(svg).toBeTruthy();
  });
};

testIcon("Capa Icon", <CapaIcon />);
testIcon("IR Dashboard Icon", <IncidentDashboardIcon />);
testIcon("IR Report Icon", <IncidentReportIcon />);
testIcon("IR Config Icon", <IrConfigIcon />);
testIcon("Masters Icon", <MastersIcon />);
testIcon("Reports Icon", <ReportsIcon />);
