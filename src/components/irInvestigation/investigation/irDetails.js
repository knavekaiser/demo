import { useEffect, useState, useCallback } from "react";
import s from "./style.module.scss";
import { Box } from "../../incidentReport";
import {
  Select,
  Table,
  TableActions,
  Combobox,
  Input,
  Textarea,
  FileInput,
  Radio,
  Tabs,
  Moment,
} from "../../elements";
import { ImEye } from "react-icons/im";
import {
  FaRegTrashAlt,
  FaCheck,
  FaPlus,
  FaPlusCircle,
  FaFlag,
  FaMinusCircle,
  FaEllipsisV,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { BsPencilFill } from "react-icons/bs";
import { useFetch } from "../../../hooks";
import { endpoints as defaultEndpoints } from "../../../config";
import { Prompt, Modal } from "../../modal";
import { useForm } from "react-hook-form";

const IrDetails = () => {
  const [inputs, setInputs] = useState([
    {
      id: 12,
      inputBy: "Mohan",
      department: "Nursing",
      query_date_time: "2022-01-05T12:34",
      query_by: "Robert",
      response_date_time: "2022-01-07T20:23",
    },
    {
      id: 13,
      inputBy: "Raghavendra",
      department: "Nursing",
      response_date_time: "2022-01-07T20:23",
    },
  ]);
  const [requestInput, setRequestInput] = useState(false);
  const [similarIncidents, setSimilarIncidents] = useState([
    {
      id: "23",
      sequence: "IR1/2/24",
      location: 1,
      incident_date_time: "2022-01-07T20:23",
    },
    {
      id: "24",
      sequence: "IR1/2/24",
      location: 1,
      incident_date_time: "2022-01-07T20:23",
    },
    {
      id: "25",
      sequence: "IR1/2/24",
      location: 1,
      incident_date_time: "2022-01-07T20:23",
    },
    {
      id: "26",
      sequence: "IR1/2/24",
      location: 1,
      incident_date_time: "2022-01-07T20:23",
    },
    {
      id: "27",
      sequence: "IR1/2/24",
      location: 1,
      incident_date_time: "2022-01-07T20:23",
    },
    {
      id: "28",
      sequence: "IR1/2/24",
      location: 1,
      incident_date_time: "2022-01-07T20:23",
    },
    {
      id: "29",
      sequence: "IR1/2/24",
      location: 1,
      incident_date_time: "2022-01-07T20:23",
    },
    {
      id: "30",
      sequence: "IR1/2/24",
      location: 1,
      incident_date_time: "2022-01-07T20:23",
    },
    {
      id: "31",
      sequence: "IR1/2/24",
      location: 1,
      incident_date_time: "2022-01-07T20:23",
    },
    {
      id: "32",
      sequence: "IR1/2/24",
      location: 1,
      incident_date_time: "2022-01-07T20:23",
    },
  ]);
  const [showSimilarIncidents, setShowSimilarIncidents] = useState(false);
  const [prevSimilarIncidents, setPrevSimilarIncidents] = useState("true");
  const [severity, setSeverity] = useState([
    { vlaue: "severe", label: "Severe" },
    { vlaue: "mild", label: "Mild" },
    { vlaue: "noHarm", label: "No Harm" },
  ]);
  const [likelihood, setLikelihood] = useState([
    { vlaue: "unlikely", label: "Unlikely" },
    { vlaue: "likely", label: "Likely" },
    { vlaue: "veryLikely", label: "Very Likely" },
  ]);
  const [notes, setNotes] = useState([
    {
      id: 2,
      note: "Incidnet occured on 5th march, but was reported on 10th march.",
      date: "2022-03-10T12:45",
    },
  ]);
  const { control } = useForm();
  return (
    <div className={s.irDetails}>
      <div className={s.similarIncidents}>
        <section className={s.similarInput}>
          <label>Previous Similar Incidents:</label>
          <Radio
            name="prevSimilarIncidents"
            options={[
              { label: "Yes", value: "true" },
              { label: "No", value: "false" },
            ]}
            value={prevSimilarIncidents}
            onChange={(e) => {
              console.log(e);
              // setPrevSimilarIncidents()
            }}
          />
        </section>
        <a onClick={() => setShowSimilarIncidents(true)}>
          {similarIncidents.length} Incidents
        </a>
      </div>
      <Box collapsable label="TABLE OF EVENTS">
        <Events />
        <div className={s.legend}>
          <FaFlag className={s.problem} /> Potential problem areas
        </div>
      </Box>
      <Box collapsable label="RISK ASSESSMENT">
        <div className={s.riskAssessment}>
          <Combobox label="Severity" options={severity} />
          <Combobox label="Likelihood" options={likelihood} />
          <Input label="Risk Category" value={"MEDIUM"} readOnly />
          <section className={s.riskIncluded}>
            <label>Risk inlcuded in Risk Register</label>
            <Radio
              options={[
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ]}
            />
          </section>
          <Input label="Risk ID" value={"Phar/1/2021"} readOnly />
        </div>
      </Box>
      <Box label="NOTES">
        <div className={s.notesWrapper}>
          <div className={s.selfReporting}>
            <section className={s.radio}>
              <label>Self reporting</label>
              <Radio
                options={[
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ]}
              />
            </section>
            <Select
              control={control}
              name="name"
              label="Name"
              options={[
                { label: "Mark Robber", value: "mark robber" },
                { label: "John Sina", value: "John Sina" },
              ]}
            />
            <Input label="Name" value={"Nursury"} readOnly />
            <Input
              label="Designation"
              value={"Head of the Department"}
              readOnly
            />
          </div>
          <div className={s.ipsg}>
            <section className={s.radio}>
              <label>IPSG Breach</label>
              <Radio
                options={[
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ]}
              />
            </section>
            <Combobox
              label="Select"
              options={[
                { label: "IPSG 1 patient identification error", value: "1" },
              ]}
            />
          </div>
          <Table
            columns={[
              { label: "Notes" },
              { label: "Date & Time" },
              { label: "Actions" },
            ]}
            className={s.notes}
          >
            <tr>
              <td className={s.inlineForm}>
                <NoteForm />
              </td>
            </tr>
            {notes.map((note) => (
              <tr key={note.id}>
                <td>{note.note}</td>
                <td>
                  <Moment format="DD/MM/YYYY hh:mm">{note.date}</Moment>
                </td>
                <TableActions
                  actions={[
                    {
                      icon: <BsPencilFill />,
                      label: "Edit",
                      callBack: () => setNotes(note),
                    },
                    {
                      icon: <FaRegTrashAlt />,
                      label: "Delete",
                      callBack: () =>
                        Prompt({
                          type: "confirmation",
                          message: `Are you sure you want to remove this note?`,
                          callback: () => {
                            // deleteCategory(null, {
                            //   params: { "{ID}": category.id },
                            // }).then(({ res }) => {
                            //   if (res.status === 204) {
                            //     setCategories((prev) =>
                            //       prev.filter((c) => c.id !== category.id)
                            //     );
                            //   } else if (res.status === 409) {
                            //     Prompt({
                            //       type: "error",
                            //       message:
                            //         "Remove children to delete this master.",
                            //     });
                            //   }
                            // });
                          },
                        }),
                    },
                  ]}
                />
              </tr>
            ))}
          </Table>
        </div>
      </Box>
      <Modal
        head
        label="RECORD INPUTS"
        open={showSimilarIncidents}
        setOpen={setShowSimilarIncidents}
        className={s.similarIncidentsModal}
      >
        <SimilarIncidents similarIncidents={similarIncidents} />
      </Modal>
      <section className={s.btns}>
        <button
          className="btn secondary wd-100"
          type="button"
          onClick={() => {}}
        >
          Close
        </button>
        <button onClick={() => {}} className="btn secondary wd-100">
          Save
        </button>
        <button onClick={() => {}} className="btn wd-100">
          Submit
        </button>
      </section>
    </div>
  );
};
const NoteForm = ({ edit, onSuccess, clearForm }) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm();

  const { post: saveEvent, put: updateEvent, loading } = useFetch(
    defaultEndpoints.investigationEvents + `/${edit?.id || ""}`
  );

  useEffect(() => {
    reset({ ...edit });
  }, [edit]);

  return (
    <form>
      <Input
        {...register("detail", { required: "Please enter Detail" })}
        error={errors.detail}
      />
      <Input
        type="datetime-local"
        {...register("date", { required: "Please enter Date & Time" })}
        error={errors.date}
      />
      <div className={s.btns}>
        <button className="btn secondary" type="submit" disabled={loading}>
          {edit ? (
            <FaCheck />
          ) : (
            <>
              <FaPlus /> Add
            </>
          )}
        </button>
        {edit && (
          <button
            type="button"
            onClick={() => clearForm(null)}
            className="btn secondary"
          >
            <IoClose />
          </button>
        )}
      </div>
    </form>
  );
};
const SimilarIncidents = ({ similarIncidents }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [ir, setIr] = useState(similarIncidents[0]);
  const [search, setSearch] = useState("");
  const [irs, setIrs] = useState([
    {
      id: "1",
      sequence: "IR1/2/25",
      rootCause: "Policy to be updated",
      actionPlan: "Policy to be updated",
      category: "Medicine",
      status: "Accepted",
      actionTaken: "Policy approved in medication review.",
      details:
        "Meical administration policy does not inlcude medication transportation",
      dateTime: "2021-08-01T15:03",
    },
    {
      id: "2",
      sequence: "IR1/2/25",
      rootCause: "Policy to be updated",
      actionPlan: "Policy to be updated",
      category: "Medicine",
      status: "Accepted",
      actionTaken: "Policy approved in medication review.",
      details:
        "Meical administration policy does not inlcude medication transportation",
      dateTime: "2021-08-01T15:03",
    },
  ]);
  return (
    <div className={s.similarIncidents}>
      <Tabs
        secondary
        tabs={[
          { label: "INCIDENT DETAILS", value: "details" },
          { label: "SUMMARY", value: "summary" },
        ]}
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab.value);
        }}
      />
      <div className={`${s.incidents} ${s[activeTab]}`}>
        {activeTab === "details" && (
          <>
            <div className={s.sidebar}>
              <Input
                label="Add similar incident"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <ul>
                {similarIncidents.map((ir) => (
                  <li key={ir.id}>
                    <div className={s.detail}>
                      <p className={s.sequence}>{ir.sequence}</p>
                      <p>{ir.location}</p>
                      <p>
                        <Moment format="DD/MM/YYYY hh:mm">
                          {ir.incident_date_time}
                        </Moment>
                      </p>
                    </div>
                    <button className="btn clear" onClick={() => {}}>
                      <FaRegTrashAlt />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className={s.irView}>
              {ir ? "Preview IR" : "No IR selected"}
            </div>
          </>
        )}
        {activeTab === "summary" && (
          <>
            <section className={s.location}>
              <h4>Summary</h4>
              <section>
                <span className={s.label}>Location: </span>
                <p>
                  Nursing Station : 3 | Pediatric ward : 1 | Surgical ward : 1
                </p>
              </section>
              <section>
                <span className={s.label}>Incident Type: </span>
                <p>Near Miss : 3 | No Harm : 1 | Adverse : 1</p>
              </section>
            </section>
            <section>
              <h4>Root Cause Analysis - Category</h4>
              <Section label="Policy not available">
                <Table
                  className={s.policy}
                  columns={[
                    { label: "IR Code" },
                    { label: "Incident Date & Time" },
                    { label: "Root Cause" },
                    { label: "Details" },
                  ]}
                >
                  {irs.map((ir) => (
                    <tr key={ir.id}>
                      <td>{ir.sequence}</td>
                      <td>
                        <Moment format="DD/MM/YYYY hh:mm">{ir.dateTime}</Moment>
                      </td>
                      <td>{ir.rootCause}</td>
                      <td>{ir.details}</td>
                    </tr>
                  ))}
                </Table>
              </Section>
            </section>
            <section>
              <h4>Correct & Preventative Action plans</h4>
              <Table
                className={s.actionPlan}
                columns={[
                  { label: "IR Code" },
                  { label: "Incident Date & Time" },
                  { label: "Action Plan" },
                  { label: "Details" },
                  { label: "Category" },
                  { label: "Status" },
                  { label: "Action Taken" },
                ]}
              >
                {irs.map((ir) => (
                  <tr key={ir.id}>
                    <td>{ir.sequence}</td>
                    <td>
                      <Moment format="DD/MM/YYYY hh:mm">{ir.dateTime}</Moment>
                    </td>
                    <td>{ir.actionPlan}</td>
                    <td>{ir.details}</td>
                    <td>{ir.category}</td>
                    <td>{ir.status}</td>
                    <td>{ir.actionTaken}</td>
                  </tr>
                ))}
              </Table>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

const Events = () => {
  const [events, setEvents] = useState([
    {
      no: 1,
      detail:
        "The outsourced company had come to fix the false ceilling the microbiology room.",
      date: "2022-05-07T17:30",
      problem: true,
    },
    {
      no: 2,
      detail:
        "While working the staffm while removing the false ceiling there was short circuit in electrical wire above the falce ceiling.",
      date: "2022-05-10T03:17",
      problem: false,
    },
  ]);
  const [edit, setEdit] = useState(null);

  const onSuccess = useCallback((newEv) => {
    setEvents((prev) => {
      return prev.find((c) => c.id === newEv.id)
        ? prev.map((c) => (c.id === newEv.id ? newEv : c))
        : [...prev, newEv];
    });
    setEdit(null);
  }, []);

  const { get: getEvents, loading } = useFetch(
    defaultEndpoints.investigationEvents
  );
  const { remove: deleteEvent } = useFetch(
    defaultEndpoints.investigationEvents + "/{ID}"
  );

  useEffect(() => {
    // getEvents()
    //   .then((data) => {
    //     if (data._embedded?.event) {
    //       setEvents(data._embedded.event);
    //     }
    //   })
    //   .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);

  return (
    <Table
      className={s.tableOfEvents}
      sortable={{
        handle: ".handle",
        removeCloneOnHide: true,
        onEnd: (e) => {
          // const itemEl = e.item;
          // const { oldIndex, newIndex } = e;
          // if (oldIndex !== newIndex) {
          //   setCodeConfig((prev) => {
          //     const videos = [
          //       ...prev.filter((item, i) => i !== oldIndex),
          //     ];
          //     videos.splice(newIndex, 0, prev[oldIndex]);
          //     return videos;
          //   });
          // }
        },
      }}
      columns={[
        { label: "S.No." },
        { label: "Details" },
        { label: "Date & Time" },
        { label: "Actions" },
      ]}
    >
      <tr>
        <td className={s.inlineForm}>
          <EventForm onSuccess={() => {}} />
        </td>
      </tr>
      {events.map((ev, i) => (
        <tr key={i}>
          <td className="handle">
            {" "}
            <FaEllipsisV /> {ev.no}
          </td>
          <td className={s.dscr}>
            <span className={`${s.flag} ${ev.problem ? s.problem : ""}`}>
              <FaFlag />
            </span>
            {ev.detail}
          </td>
          <td>{ev.date}</td>
          <TableActions
            actions={[
              {
                icon: <BsPencilFill />,
                label: "Edit",
                callBack: () => setEdit(ev),
              },
              {
                icon: <FaRegTrashAlt />,
                label: "Delete",
                callBack: () =>
                  Prompt({
                    type: "confirmation",
                    message: `Are you sure you want to remove this event?`,
                    callback: () => {
                      deleteEvent(null, {
                        params: { "{ID}": ev.id },
                      }).then(({ res }) => {
                        if (res.status === 204) {
                          setEvents((prev) =>
                            prev.filter((c) => c.id !== ev.id)
                          );
                        }
                      });
                    },
                  }),
              },
            ]}
          />
        </tr>
      ))}
    </Table>
  );
};
const EventForm = ({ edit, onSuccess, clearForm }) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm();

  const { post: saveEvent, put: updateEvent, loading } = useFetch(
    defaultEndpoints.investigationEvents + `/${edit?.id || ""}`
  );

  useEffect(() => {
    reset({ ...edit });
  }, [edit]);

  return (
    <form>
      <span />
      <Input
        {...register("detail", { required: "Please enter Detail" })}
        error={errors.detail}
      />
      <Input
        type="datetime-local"
        {...register("date", { required: "Please enter Date & Time" })}
        error={errors.date}
      />
      <div className={s.btns}>
        <button className="btn secondary" type="submit" disabled={loading}>
          {edit ? (
            <FaCheck />
          ) : (
            <>
              <FaPlus /> Add
            </>
          )}
        </button>
        {edit && (
          <button
            type="button"
            onClick={() => clearForm(null)}
            className="btn secondary"
          >
            <IoClose />
          </button>
        )}
      </div>
    </form>
  );
};

const Section = ({ label, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <section className={s.collapsableSection}>
      <button
        className={`btn clear ${s.header}`}
        onClick={() => setOpen(!open)}
      >
        {open ? <FaMinusCircle /> : <FaPlusCircle />} {label}
      </button>
      {open && <div className={s.content}>{children}</div>}
    </section>
  );
};

export default IrDetails;
