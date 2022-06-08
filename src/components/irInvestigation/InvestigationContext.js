import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SiteContext } from "../../SiteContext";
import { irStatus, endpoints as defaultEndpoints } from "../../config";
import { useFetch } from "../../hooks";
import { Prompt } from "../../components/modal";

export const InvestigationContext = createContext();
export const InvestigationProvider = ({ children }) => {
  const [ir, setIr] = useState({});
  const { user } = useContext(SiteContext);

  const params = useParams();

  const { get: getIr, put: update, loading } = useFetch(
    defaultEndpoints.incidentReport + "/" + params.irId
  );

  useEffect(() => {
    if (ir.irInvestigation?.length && ir.status.toString() !== "4") {
      update({
        ...ir,
        actionTakens: undefined,
        status: 4,
        irStatusDetails: [
          // ...ir.irStatusDetails,
          {
            status: 4,
            dateTime: new Date().toISOString(),
            userid: user.id,
          },
        ],
      })
        .then((data) => {
          if (data.id) {
            setIr({
              ...data,
              ...(data.irInvestigation.length && {
                irInvestigation: [
                  {
                    ...data.irInvestigation[0],
                    events:
                      data.irInvestigation[0].events?.sort((a, b) =>
                        a.sequence > b.sequence ? 1 : -1
                      ) || [],
                  },
                ],
              }),
            });
          }
        })
        .catch((err) =>
          Prompt({
            type: "error",
            message: err.message,
          })
        );
    }
  }, [ir]);

  useEffect(() => {
    getIr().then(({ data }) => {
      if (data) {
        setIr({
          ...data,
          ...(data.irInvestigation.length && {
            irInvestigation: [
              {
                ...data.irInvestigation[0],
                events:
                  data.irInvestigation[0].events?.sort((a, b) =>
                    a.sequence > b.sequence ? 1 : -1
                  ) || [],
              },
            ],
          }),
        });
      }
    });
  }, []);
  return (
    <InvestigationContext.Provider
      value={{
        ir,
        setIr,
      }}
    >
      {children}
    </InvestigationContext.Provider>
  );
};
