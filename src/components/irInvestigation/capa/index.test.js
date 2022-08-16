import { act, fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from "react-router-dom";
import { SiteContext, IrDashboardContext } from "../../../SiteContext";
import { InvestigationContext } from "../InvestigationContext";
import ReactDOM from "react-dom";
import { mockData as data, irContextData, setMockFetch, setMockFailFetch, providerProps } from "../../../config/mocks";
import Capa from '.';
import userEvent from '@testing-library/user-event';

const customRender = async (ui, { providerProps, ...renderOptions}) => {
    return await act(async () => {
        await render(
            <BrowserRouter>
              <SiteContext.Provider value={providerProps}>
                <IrDashboardContext.Provider
                  value={irContextData}
                >
                  <InvestigationContext.Provider
                    value={{
                      ir: {
                        irTeam: [
                          { dept: 2, designation: "asdfasd", username: 1 },
                          { dept: 2233, designation: "asdfasd", username: 10 },
                        ],
                        rcaTeam: [
                            { id: 1, userName: 'test', dept: 2, designation: "asdfasd", action: 'add' },
                            { id: 2, userName: 'test 2', dept: 3, designation: "asdfasd", action: 'edit' }
                        ],
                        capaPlan: [
                            {id: 1, actionPlan: 'test', details: 'testing purpose', monitorEff: true, category: 'test'}
                        ],
                        rcaIdentified: [
                            {rootCause: 'test', rcaCat: 1, details: 'testing purpose'}
                        ]
                      },
                    }}
                  >
                    {ui}
                  </InvestigationContext.Provider>
                </IrDashboardContext.Provider>
              </SiteContext.Provider>
            </BrowserRouter>,
            renderOptions
          );
    });
};

describe("CAPA", () => {
    beforeAll(() => {
      ReactDOM.createPortal = jest.fn((element, node) => {
        return element;
      });
    });
    beforeEach(async () => {
      let portal = document.querySelector("#portal");
      if (!portal) {
        portal = document.createElement("div");
        portal.id = "portal";
        document.body.appendChild(portal);
      }
  
      let prompt = document.querySelector("#prompt");
      if (!prompt) {
        const prompt = document.createElement("div");
        prompt.id = "prompt";
        document.body.appendChild(prompt);
      }
      setMockFetch(data);
    });
  
    test('render correctly', async () => {
        await customRender(<Capa />, { providerProps });
        expect(screen.getByTestId('capa')).toBeInTheDocument();
    });

    test('Monitoring action plans table edit', async () => {
        await customRender(<Capa />, { providerProps });
        const editBtn = document.querySelector('.preventiveActionPlans button[title="Edit"]');
        await fireEvent.click(editBtn);
        const PreventiveActionPlansFormClose = screen.getByTestId('PreventiveActionPlansFormClose');
        await act(async () => {
            expect(PreventiveActionPlansFormClose).toBeInTheDocument();
        });
        await fireEvent.click(PreventiveActionPlansFormClose);
    });

    test('Monitoring action plans table delete', async () => {
        await customRender(<Capa />, { providerProps });
        const deleteBtn = document.querySelector('.preventiveActionPlans button[title="Delete"]');
        await fireEvent.click(deleteBtn);
        await act(async () => {
            expect(screen.getByTestId('prompt')).toBeInTheDocument();
        });
    });

    test('Monitoring action plans table delete confirm', async () => {
        await customRender(<Capa />, { providerProps });
        const deleteBtn = document.querySelector('.preventiveActionPlans button[title="Delete"]');
        await fireEvent.click(deleteBtn);
        const prompt = screen.getByTestId('prompt');
        const yesBtn =  prompt.querySelector('.yes');
        await fireEvent.click(yesBtn);
    });

    test('prevent action plans table edit', async () => {
        await customRender(<Capa />, { providerProps });
        const tableActions = screen.getAllByTestId('tableActions');
        const editBtn = tableActions[1].querySelector('button[title="Edit"]');
        await fireEvent.click(editBtn);
        const irTeamMemberFormClose = screen.getByTestId('irTeamMemberFormClose');
        await act(async () => {
            expect(irTeamMemberFormClose).toBeInTheDocument();
        });
        await fireEvent.click(irTeamMemberFormClose);
    });

    test('prevent action plans table delete', async () => {
        await customRender(<Capa />, { providerProps });
        const tableActions = screen.getAllByTestId('tableActions');
        const deleteBtn = tableActions[1].querySelector('button[title="Delete"]');
        await fireEvent.click(deleteBtn);
        await act(async () => {
            expect(screen.getByTestId('prompt')).toBeInTheDocument();
        });
    });

    test('prevent action plans table delete confirm', async () => {
        await customRender(<Capa />, { providerProps });
        const tableActions = screen.getAllByTestId('tableActions');
        const deleteBtn = tableActions[1].querySelector('button[title="Delete"]');
        await fireEvent.click(deleteBtn);
        const prompt = screen.getByTestId('prompt');
        const yesBtn =  prompt.querySelector('.yes');
        await fireEvent.click(yesBtn);
    });

    test('PreventiveActionPlansForm submit', async () => {
        await customRender(<Capa />, { providerProps });
        const PreventiveActionPlansForm = screen.getByTestId('PreventiveActionPlansForm');
        const formInputs = PreventiveActionPlansForm.querySelectorAll('input[type="text"');
        userEvent.type(formInputs[0], 'test');
        userEvent.type(formInputs[1], 'test');
        userEvent.type(formInputs[2], 'test');
        const formCheckbox = PreventiveActionPlansForm.querySelectorAll('input[type="checkbox"');
        fireEvent.click(formCheckbox[0]);
        const formDate = PreventiveActionPlansForm.querySelector('input[type="date"');
        userEvent.type(formDate, '2018-01-01');
        const select = screen.getAllByRole('combobox');
        await fireEvent.keyDown(select[0], { keyCode: 38 });
        await fireEvent.keyDown(select[0], { keyCode: 32 });
        const combobox = PreventiveActionPlansForm.querySelectorAll('[data-testid="combobox-container"] .field');
        await fireEvent.click(combobox[0]);
        const comboboxOptions = document.querySelectorAll('.modal ul li');
        await fireEvent.click(comboboxOptions[0]);
        await fireEvent.keyDown(combobox[0], { keyCode: 27 });
        await fireEvent.click(combobox[1]);
        const comboboxOptions2 = document.querySelectorAll('.modal ul li');
        await fireEvent.click(comboboxOptions2[0]);
        await act(async () => {
            const submitBtn = PreventiveActionPlansForm.querySelector('button[type="submit"]');
            await submitBtn.click();
        });
    });

    test('RcaTeamMembers action plans table delete', async () => {
        await customRender(<Capa />, { providerProps });
        const deleteBtn = document.querySelector('.rcaTeamMembers button[title="Delete"]');
        await fireEvent.click(deleteBtn);
        await act(async () => {
            expect(screen.getByTestId('prompt')).toBeInTheDocument();
        });
    });

    test('RcaTeamMembers action plans table delete confirm', async () => {
        await customRender(<Capa />, { providerProps });
        const deleteBtn = document.querySelector('.rcaTeamMembers button[title="Delete"]');
        await fireEvent.click(deleteBtn);
        const prompt = screen.getByTestId('prompt');
        const yesBtn =  prompt.querySelector('.yes');
        await fireEvent.click(yesBtn);
    });

    test('show plan monitoring component', async () => {
        await customRender(<Capa />, { providerProps });
        const yesBtn = document.querySelector(`.preventiveActionPlans .planMonitoringYes`);
        await fireEvent.click(yesBtn);
        await act(async () => {
            expect(document.querySelector('.monitoringPlanModalContent')).toBeInTheDocument();
        });
        fireEvent.click(document.querySelector('.monitoringPlanModalContent .clear-btn'));
    })
});