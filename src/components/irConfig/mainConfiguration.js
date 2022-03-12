import { useState } from "react";
import {
  FaInfoCircle,
  FaPlus,
  FaRegTrashAlt,
  FaUndo,
  FaPlayCircle,
  FaStopCircle,
} from "react-icons/fa";
import { Routes, Route } from "react-router-dom";
import { BsPencilFill } from "react-icons/bs";
import { BiSearch } from "react-icons/bi";
import { Box } from "../incidentReport";
import { TiTick } from "react-icons/ti";
import { IoIosClose } from "react-icons/io";
import {
  Input,
  MobileNumberInput,
  CustomRadio,
  Combobox,
  Table,
  TableActions,
  Toggle,
} from "../elements";
import { Modal } from "../modal";
import { useForm } from "react-hook-form";
import paths from "../path";
import s from "./config.module.scss";

const IrScreen = () => {
  const [screens, setScreens] = useState([
    {
      option: "Location one",
      status: true,
      rules: "2021-12-21T15:56:09.153Z",
    },
    {
      option: "Location two",
      status: true,
      rules: null,
    },
    {
      option: "Location two",
      status: false,
      rules: "2021-12-21T15:56:09.153Z",
    },
    { option: "Location two", status: true, rules: "2021-12-21T15:56:09.153Z" },
  ]);
  return (
    <Box label="INCIDENT REPORTING SCREEN" collapsable={true}>
      <Table
        className={s.reportScreen}
        columns={[
          { label: "Option" },
          { label: "Enable/Disable" },
          { label: "Rules" },
        ]}
      >
        {screens.map((scr, i) => (
          <tr key={i}>
            <td>{scr.option}</td>
            <td>
              <Toggle readOnly={true} defaultValues={scr.status} />
            </td>
            <td>{scr.rules}</td>
          </tr>
        ))}
      </Table>
      <div className={s.btns}>
        <button className="btn w-100">Save</button>
      </div>
    </Box>
  );
};

const TypesOfIncident = () => {
  const [typesOfIncident, setTypesOfIncident] = useState([
    {
      id: "1",
      type: "Unsafe Condition",
      definition:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      reportingScreen: "Neamiss Template",
      rcaStatus: true,
      rcaTempalte: "RCA-Template two",
    },
    {
      id: "2",
      type: "Unsafe Condition",
      definition:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      reportingScreen: "Neamiss Template",
      rcaStatus: true,
      rcaTempalte: "RCA-Template two",
    },
    {
      id: "3",
      type: "Unsafe Condition",
      definition:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      reportingScreen: "Neamiss Template",
      rcaStatus: true,
      rcaTempalte: "RCA-Template two",
    },
  ]);
  return (
    <Box label="TYPE OF INCIDENT" collapsable={true}>
      <Table
        className={s.typeOfIncident}
        columns={[
          { label: "Option" },
          { label: "Definition" },
          { label: "Reporting Screen Template" },
          { label: "Enable RCA" },
          { label: "RCA Template" },
          { label: "Actions" },
        ]}
      >
        {typesOfIncident.map((inc, i) => (
          <tr key={i}>
            <td>
              <input type="checkbox" /> {inc.type}
            </td>
            <td className={s.definition}>{inc.definition}</td>
            <td>{inc.reportingScreen}</td>
            <td>
              <Toggle readOnly={true} defaultValue={inc.rcaStatus} />
            </td>
            <td>{inc.rcaTempalte}</td>
            <TableActions
              actions={[
                {
                  icon: <BsPencilFill />,
                  label: "Edit",
                  callBack: () => {},
                },
                {
                  icon: <FaUndo />,
                  label: "Undo",
                  callBack: () => {},
                },
              ]}
            />
          </tr>
        ))}
      </Table>
      <div className={s.infoForm}>
        <Input label="Information for type of incident" />
        <section>
          <input type="checkbox" id="sendThank" />
          <label htmlFor="sendThank">
            Send thank you notification to RCA team members.
          </label>
        </section>
      </div>
      <div className={s.btns}>
        <button className="btn w-100">Save</button>
      </div>
    </Box>
  );
};

const SentinelEventNotification = () => {
  const [sentinelNotification, setSentinelNotification] = useState([
    {
      id: "user123",
      department: "Department name one",
      designation: "designation",
      phone: "+902415151515",
      email: "some@email.com",
    },
    {
      id: "user123",
      department: "Department name one",
      designation: "designation",
      phone: "+902415151515",
      email: "some@email.com",
    },
    {
      id: "user123",
      department: "Department name one",
      designation: "designation",
      phone: "+902415151515",
      email: "some@email.com",
    },
  ]);
  return (
    <Box label="SENTINEL EVENT NOTIFICATION" collapsable={true}>
      <div className={s.sentinelNotificationHead}>
        <p>Notify to:</p>
        <section className={s.notificationOptions}>
          <p>Notify Through:</p>
          <section>
            <input type="checkbox" id="notifyThrough-email" />
            <label htmlFor="notifyThrough-email">Email</label>
          </section>
          <section>
            <input type="checkbox" id="notifyThrough-phone" />
            <label htmlFor="notifyThrough-phone">Phone</label>
          </section>
        </section>
      </div>
      <Table
        className={s.sentinelNotification}
        columns={[
          { label: "User" },
          { label: "Department" },
          { label: "Designation" },
          { label: "Mobile Number" },
          { label: "Email" },
          { label: "Action" },
        ]}
      >
        <tr>
          <td className={s.inlineForm}>
            <NotifyForm />
          </td>
        </tr>
        {sentinelNotification.map((user, i) => (
          <tr key={i}>
            <td>{user.id}</td>
            <td>{user.department}</td>
            <td>{user.designation}</td>
            <td>{user.phone}</td>
            <td>{user.email}</td>
            <TableActions
              actions={[
                {
                  icon: <BsPencilFill />,
                  label: "Edit",
                  callBack: () => {},
                },
                {
                  icon: <FaRegTrashAlt />,
                  label: "Delete",
                  callBack: () => {},
                },
              ]}
            />
          </tr>
        ))}
      </Table>
      <div className={s.sentinelNotificationContent}>
        <h4>E-mail/SMS Notification Content</h4>
        <p>
          <strong>Subject</strong>: Sentinel Event reported.
          <br />
          Please find below details for the sentinel event reported.
        </p>
        <section className={s.checkboxes}>
          <section>
            <input type="checkbox" id="notiContent-irCode" />
            <label htmlFor="notiContent-irCode">IR code</label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-category" />
            <label htmlFor="notiContent-category">Category</label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-subCategory" />
            <label htmlFor="notiContent-subCategory">Subcategory</label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-incidentLocation" />
            <label htmlFor="notiContent-incidentLocation">
              Incident Location
            </label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-name" />
            <label htmlFor="notiContent-name">Reported by name</label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-department" />
            <label htmlFor="notiContent-department">
              Reported by department
            </label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-IncidentDatetime" />
            <label htmlFor="notiContent-IncidentDatetime">
              Date & time of incident
            </label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-reportDatetime" />
            <label htmlFor="notiContent-reportDatetime">
              Reporting date & time
            </label>
          </section>
        </section>
        <p>Please contact IR manager for further information.</p>
      </div>
      <div className={s.btns}>
        <button className="btn w-100">Save</button>
      </div>
    </Box>
  );
};
const NotifyForm = ({ edit, onChange }) => {
  const { register, watch } = useForm();
  return (
    <form>
      <Input required={true} name="name" placeholder="Enter" />
      <Input required={true} name="dob" placeholder="Enter" />
      <Input required={true} name="employeeId" placeholder="Enter" />
      <MobileNumberInput
        register={register}
        required={true}
        name="contact"
        placeholder="Enter"
        watch={watch}
      />
      <Input required={true} email="email" placeholder="Enter" />
      <button className="btn secondary">
        <FaPlus /> Add
      </button>
    </form>
  );
};

const HodApprovalProcess = () => {
  return (
    <Box label="HOD APPROVAL PROCESS" collapsable={true}>
      <Table className={s.hodApproval} columns={[{ label: "Select" }]}>
        <tr>
          <td>
            <input
              type="checkbox"
              id="hodApproval-required"
              onChange={() => {}}
            />
            <label htmlFor="hodApproval-required">
              <strong>
                HOD approval required - IR team can start investigation only
                after IS is approved
              </strong>
            </label>
          </td>
        </tr>
        <tr>
          <td>
            <input
              type="checkbox"
              id="hodApproval-acknowledgement"
              onChange={() => {}}
            />
            <label htmlFor="hodApproval-acknowledgement">
              <strong>HOD acknowledgement</strong> - IR is sent to HOD for
              acknowledgement, however, the step has no dependency on further
              actions.
            </label>
          </td>
        </tr>
        <tr>
          <td>
            <input type="checkbox" id="hodApproval-none" onChange={() => {}} />
            <label htmlFor="hodApproval-none">
              <strong>None</strong> - HOD is not notified of the reported IR.
              HOD dashboard will be disabled.
            </label>
          </td>
        </tr>
      </Table>
      <div className={s.btns}>
        <button className="btn w-100">Save</button>
      </div>
    </Box>
  );
};

const DashboardDataElements = () => {
  const [dashboardDataElements, setDashboardDataElements] = useState([
    {
      option: "Submitted IRs",
      irManager: true,
      irInvestigator: true,
    },
    {
      option: "Approved IRs",
      irManager: true,
      irInvestigator: true,
    },
    {
      option: "Rejected IRs",
      irManager: false,
      irInvestigator: true,
    },
    {
      option: "Re-approval request",
      irManager: false,
      irInvestigator: true,
    },
    {
      option: "Assigned IRs",
      irManager: true,
      irInvestigator: true,
    },
    {
      option: "Under Investigation",
      irManager: false,
      irInvestigator: false,
    },
    {
      option: "CAPA planning",
      irManager: false,
      irInvestigator: false,
    },
    {
      option: "Closure confirmation",
      irManager: true,
      irInvestigator: true,
    },
    {
      option: "Closure confirmed",
      irManager: false,
      irInvestigator: false,
    },
    {
      option: "IR Closure",
      irManager: false,
      irInvestigator: true,
    },
    {
      option: "CAPA Closed",
      irManager: false,
      irInvestigator: true,
    },
  ]);
  return (
    <Box label="DASHBOARD DATA ELEMENT" collapsable={true}>
      <i>
        Configure the data elements to show in the left menu for specified user
        roles.
      </i>
      <div className={s.dashboardDataElement}>
        <Table
          columns={[
            { label: "Status Option" },
            { label: "IR Manager" },
            { label: "IR Investigator" },
          ]}
        >
          {dashboardDataElements.map((item, i) => (
            <tr key={i}>
              <td>{item.option}</td>
              <td>
                <section>
                  <input
                    type="checkbox"
                    id={`dashboardDataElements-${item.option}-manager`}
                    checked={item.irManager}
                    onChange={() => {}}
                  />
                  <label
                    htmlFor={`dashboardDataElements-${item.option}-manager`}
                  >
                    Visible
                  </label>
                </section>
              </td>
              <td>
                <section>
                  <input
                    type="checkbox"
                    id={`dashboardDataElements-${item.option}-investigator`}
                    checked={item.irInvestigator}
                    onChange={() => {}}
                  />
                  <label
                    htmlFor={`dashboardDataElements-${item.option}-investigator`}
                  >
                    Visible
                  </label>
                </section>
              </td>
            </tr>
          ))}
        </Table>
        <div>
          <Table
            columns={[
              { label: "Statistics Option" },
              { label: "IR Manager" },
              { label: "IR Investigator" },
            ]}
          >
            {dashboardDataElements.map((item, i) => (
              <tr key={i}>
                <td>{item.option}</td>
                <td>
                  <section>
                    <input
                      type="checkbox"
                      id={`dashboardDataElements-${item.option}-manager`}
                      checked={item.irManager}
                      onChange={() => {}}
                    />
                    <label
                      htmlFor={`dashboardDataElements-${item.option}-manager`}
                    >
                      Visible
                    </label>
                  </section>
                </td>
                <td>
                  <section>
                    <input
                      type="checkbox"
                      id={`dashboardDataElements-${item.option}-investigator`}
                      checked={item.irInvestigator}
                      onChange={() => {}}
                    />
                    <label
                      htmlFor={`dashboardDataElements-${item.option}-investigator`}
                    >
                      Visible
                    </label>
                  </section>
                </td>
              </tr>
            ))}
          </Table>
          <section className={s.enableIR}>
            <label>Enable cancel IR function</label>
            <Toggle readOnly={true} defaultValue={true} />
          </section>
        </div>
      </div>
      <div className={s.btns}>
        <button className="btn w-100">Save</button>
      </div>
    </Box>
  );
};

const IncidentClosure = () => {
  return (
    <Box label="INCIDENT CLOSURE" collapsable={true}>
      <div className={s.incidentClosure}>
        <p>IR closure format to include</p>
        <section className={s.checkboxes}>
          <section>
            <input type="checkbox" id="notiContent-irCode" />
            <label htmlFor="notiContent-irCode">IR code</label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-category" />
            <label htmlFor="notiContent-category">Category</label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-subCategory" />
            <label htmlFor="notiContent-subCategory">Subcategory</label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-incidentLocation" />
            <label htmlFor="notiContent-incidentLocation">
              Incident Location
            </label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-name" />
            <label htmlFor="notiContent-name">Reported by name</label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-department" />
            <label htmlFor="notiContent-department">
              Reported by department
            </label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-IncidentDatetime" />
            <label htmlFor="notiContent-IncidentDatetime">
              Date & time of incident
            </label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-reportDatetime" />
            <label htmlFor="notiContent-reportDatetime">
              Reporting date & time
            </label>
          </section>
        </section>
        <div className={s.capaClosure}>
          <section>
            <label>Enable CAPA effectiveness monitoring</label>
            <Toggle readOnly={true} defaultValue={true} />
          </section>
          <section>
            <label>Send CAPA closure report</label>
            <Toggle readOnly={true} defaultValue={true} />
          </section>
          <section>
            <input type="checkbox" id="sendThank-2" />
            <label htmlFor="sendThank-2">
              Send thank you notification to RCA team members
            </label>
          </section>
        </div>
      </div>
      <div className={s.btns}>
        <button className="btn w-100">Save</button>
      </div>
    </Box>
  );
};

const AcceptableTat = () => {
  return (
    <Box label="ACCEPTABLE TAT" collapsable={true}>
      <div className={s.acceptableTat}>
        <p>IR closure TAT monitoring</p>
        <div className={s.tatMonitoring}>
          <section className={s.start}>
            <label>
              <FaPlayCircle /> Start:
            </label>
            <input
              value="Incident reporting date"
              readOnly={true}
              disabled={true}
            />
          </section>
          <section className={s.stop}>
            <label>
              <FaStopCircle />
            </label>
            <input value="IR closure date" readOnly={true} disabled={true} />
          </section>
        </div>
        <p>Acceptable TAT</p>
        <div className={s.tatDays}>
          <div className={s.days}>
            <Input
              className={`flex ${s.numberOfDays}`}
              label="Acceptable TAT"
              placeholder="0"
              type="number"
              min={0}
            />{" "}
            days <span className={s.divider}>|</span>
            <CustomRadio
              label="Exclude Days of week:"
              options={[
                { label: "M", value: "mon" },
                { label: "T", value: "tue" },
                { label: "W", value: "wed" },
                { label: "T", value: "thu" },
                { label: "F", value: "fri" },
                { label: "S", value: "sat" },
              ]}
            />
          </div>
          <div className={s.days}>
            <Input
              className={`flex ${s.numberOfDays}`}
              label="Acceptable TAT for sentinel event"
              placeholder="0"
              type="number"
              min={0}
            />{" "}
            days <span className={s.divider}>|</span>
            <CustomRadio
              label="Exclude Days of week:"
              options={[
                { label: "M", value: "mon" },
                { label: "T", value: "tue" },
                { label: "W", value: "wed" },
                { label: "T", value: "thu" },
                { label: "F", value: "fri" },
                { label: "S", value: "sat" },
              ]}
            />
          </div>
        </div>
      </div>
      <div className={s.btns}>
        <button className="btn w-100">Save</button>
      </div>
    </Box>
  );
};

const IrInvestigationDetails = () => {
  return (
    <Box label="IR INVESTIGATION-DETAILS" collapsable={true}>
      <div className={s.irInvestigationDetail}>
        <section className={s.section_1}>
          <section>
            <label>View related incidents</label>
            <Toggle readOnly={true} defaultValue={true} />
          </section>
        </section>
        <section className={s.section_2}>
          <label>Criteria for automated similar incident alert</label>
          <div className={s.checkboxes}>
            <span>Show IR's of:</span>
            <section>
              <input type="checkbox" id="ir-alert-sameCategory" />
              <label htmlFor="ir-alert-sameCategory">Same category</label>
            </section>
            <section>
              <input type="checkbox" id="ir-alert-sameSubcategory" />
              <label htmlFor="ir-alert-sameSubcategory">
                Same Sub-category
              </label>
            </section>
            <section>
              <input type="checkbox" id="ir-alert-typeOfIncident" />
              <label htmlFor="ir-alert-typeOfIncident">Type of incident</label>
            </section>
            <section>
              <input type="checkbox" id="ir-alert-sameLocation" />
              <label htmlFor="ir-alert-sameLocation">Same Location type</label>
            </section>
            <Combobox
              className={s.duration}
              label="Duration"
              options={[
                { value: 1, label: "Last one year" },
                { value: 2, label: "Last two years" },
                { value: 3, label: "Last three years" },
              ]}
            />
          </div>
        </section>
        <section className={s.section_3}>
          <section>
            <label>View related incidents</label>
            <Toggle readOnly={true} defaultValue={true} />
          </section>
          <section>
            <label>Mark self reporting IRs</label>
            <Toggle readOnly={true} defaultValue={true} />
          </section>
          <section>
            <label>Mark IPSG Type</label>
            <Toggle readOnly={true} defaultValue={true} />
          </section>
          <section>
            <input type="checkbox" id="irInvestigationDetail-sendThank" />
            <label htmlFor="irInvestigationDetail-sendThank">
              Send thank you notification for self-Reorting IR
            </label>
          </section>
        </section>
      </div>
      <div className={s.btns}>
        <button className="btn w-100">Save</button>
      </div>
    </Box>
  );
};

export default function MainConfig() {
  const [notifyThrough, setNotifyThrough] = useState(["email", "sms"]);

  return (
    <div className={s.container} data-testid="mainConfig">
      <header>
        <h3>IR CONFIGURATION</h3>
      </header>
      <IrScreen />
      <TypesOfIncident />
      <SentinelEventNotification />
      <HodApprovalProcess />
      <DashboardDataElements />
      <IncidentClosure />
      <AcceptableTat />
      <IrInvestigationDetails />
    </div>
  );
}
