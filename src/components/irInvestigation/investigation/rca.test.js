import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from "react-router-dom";
import { SiteContext, IrDashboardContext } from "../../../SiteContext";
import { InvestigationContext } from "../InvestigationContext";
import ReactDOM from "react-dom";
import { mockData as data, irContextData, setMockFetch, setMockFailFetch, providerProps, investigationContext } from "../../../config/mocks";
import userEvent from '@testing-library/user-event';
import Rca from './rca';

const customRender = async (ui, { providerProps, investigationContextProps = investigationContext, ...renderOptions}) => {
    return await act(async () => {
        await render(
            <BrowserRouter>
              <SiteContext.Provider value={providerProps}>
                <IrDashboardContext.Provider
                  value={irContextData}
                >
                  <InvestigationContext.Provider
                    value={investigationContextProps}
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

describe("Rca", () => {
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
      await customRender(<Rca />, { providerProps });
      expect(document.querySelector('.rca')).toBeInTheDocument();
    });

    test('irTeamMemberForm 1 action plans table edit', async () => {
      await customRender(<Rca />, { providerProps });
      const editBtn = document.querySelectorAll('.rcaTeamMembers button[title="Edit"]');
      await act(async () => {
        await fireEvent.click(editBtn[0]);
      });
      const PreventiveActionPlansFormClose = screen.getByTestId('identifiedRootCauseClose');
      await act(async () => {
          expect(PreventiveActionPlansFormClose).toBeInTheDocument();
      });
      await fireEvent.click(PreventiveActionPlansFormClose);
    });
  
    test('identifiedRootCause action plans table delete', async () => {
      await customRender(<Rca />, { providerProps });
      const deleteBtn = document.querySelectorAll('.rcaTeamMembers button[title="Delete"]');
      await fireEvent.click(deleteBtn[0]);
      await act(async () => {
          expect(screen.getByTestId('prompt')).toBeInTheDocument();
      });
    });
  
    test('identifiedRootCause action plans table delete confirm', async () => {
      await customRender(<Rca />, { providerProps });
      const deleteBtn = document.querySelectorAll('.rcaTeamMembers button[title="Delete"]');
      await fireEvent.click(deleteBtn[0]);
      const prompt = screen.getByTestId('prompt');
      const yesBtn =  prompt.querySelector('.yes');
      await fireEvent.click(yesBtn);
    });

    test('identifiedRootCause action plans table edit', async () => {
      await customRender(<Rca />, { providerProps });
      const editBtn = document.querySelectorAll('.rcaTeamMembers button[title="Edit"]');
      await act(async () => {
        await fireEvent.click(editBtn[1]);
      });
      const PreventiveActionPlansFormClose = screen.getByTestId('irTeamMemberFormClose');
      await act(async () => {
          expect(PreventiveActionPlansFormClose).toBeInTheDocument();
      });
      await fireEvent.click(PreventiveActionPlansFormClose);
    });
  
    test('irTeamMemberForm 2 action plans table delete', async () => {
      await customRender(<Rca />, { providerProps });
      const deleteBtn = document.querySelectorAll('.rcaTeamMembers button[title="Delete"]');
      await fireEvent.click(deleteBtn[1]);
      await act(async () => {
          expect(screen.getByTestId('prompt')).toBeInTheDocument();
      });
    });
  
    test('irTeamMemberForm 2 action plans table delete confirm', async () => {
      await customRender(<Rca />, { providerProps });
      const deleteBtn = document.querySelectorAll('.rcaTeamMembers button[title="Delete"]');
      await fireEvent.click(deleteBtn[1]);
      const prompt = screen.getByTestId('prompt');
      const yesBtn =  prompt.querySelector('.yes');
      await fireEvent.click(yesBtn);
    });

    test('irTeamMemberForm submit', async () => {
      await act(async () => {
        await customRender(<Rca />, { providerProps });
      });
      const irTeamMemberForm = screen.getByTestId('irTeamMemberForm');
      const select = screen.getAllByRole('combobox');
      await act(async () => {
        await fireEvent.keyDown(select[1], { keyCode: 40 });
        await fireEvent.keyDown(select[1], { keyCode: 32 });
      });
      await act(async () => {
        await fireEvent.keyDown(select[0], { keyCode: 40 });
        await fireEvent.keyDown(select[0], { keyCode: 32 });
      });
      await act(async () => {
        const eviDesc = irTeamMemberForm.querySelector('input[type="text"]');
        await fireEvent.input(eviDesc, { target: { value: 'testing' } });
      });
      await act(async () => {
        const submitBtn = irTeamMemberForm.querySelector('button[type="submit"]');
        await fireEvent.click(submitBtn);
      });
    });

    test('causes breakdon clear', async () => {
      await act(async () => {
        await customRender(<Rca />, { providerProps });
      });
      const breakbtn = document.querySelector('.causeBreakdown .btn.clear');
      await fireEvent.click(breakbtn);
      const clearBtn = document.querySelectorAll('.causeBreakdown ul li ul li .btn.clear');
      await fireEvent.click(clearBtn[0]);
      await fireEvent.click(clearBtn[1]);
      const prompt = screen.getByTestId('prompt');
      const yesBtn =  prompt.querySelector('.yes');
      await fireEvent.click(yesBtn);
    });

    test('AddCauseFrom submit', async () => {
      await act(async () => {
        await customRender(<Rca />, { providerProps });
      });
      const addCauseFrom = screen.getByTestId('addCauseForm');
      const select = screen.getAllByRole('combobox');
      await act(async () => {
        const radio = document.querySelector(`input[name='type']`);
        fireEvent.change(radio, { target: { value: '3' } });
      });
      await act(async () => {
        await fireEvent.keyDown(select[0], { keyCode: 40 });
        await fireEvent.keyDown(select[0], { keyCode: 32 });
      });
      await act(async () => {
        const submitBtn = addCauseFrom.querySelector('button[type="submit"]');
        await fireEvent.click(submitBtn);
      });
    });
});