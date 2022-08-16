import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from "react-router-dom";
import { SiteContext, IrDashboardContext } from "../../../SiteContext";
import { InvestigationContext } from "../InvestigationContext";
import ReactDOM from "react-dom";
import { mockData as data, irContextData, setMockFetch, setMockFailFetch, providerProps, investigationContext } from "../../../config/mocks";
import userEvent from '@testing-library/user-event';
import IrInput from './irInput';

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

describe("IrInput", () => {
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
        await customRender(<IrInput />, { providerProps });
        expect(document.querySelector('.irInput')).toBeInTheDocument();
    });

    test('evidences action plans table edit', async () => {
      await customRender(<IrInput />, { providerProps });
      const editBtn = document.querySelector('.evidences button[title="Edit"]');
      await act(async () => {
        await fireEvent.click(editBtn);
      });
      const PreventiveActionPlansFormClose = screen.getByTestId('EvidenceFormClose');
      await act(async () => {
          expect(PreventiveActionPlansFormClose).toBeInTheDocument();
      });
      await fireEvent.click(PreventiveActionPlansFormClose);
    });
  
    test('evidences action plans table delete', async () => {
      await customRender(<IrInput />, { providerProps });
      const deleteBtn = document.querySelector('.evidences button[title="Delete"]');
      await fireEvent.click(deleteBtn);
      await act(async () => {
          expect(screen.getByTestId('prompt')).toBeInTheDocument();
      });
    });
  
    test('evidences action plans table delete confirm', async () => {
      await customRender(<IrInput />, { providerProps });
      const deleteBtn = document.querySelector('.evidences button[title="Delete"]');
      await fireEvent.click(deleteBtn);
      setMockFetch(data, 204);
      const prompt = screen.getByTestId('prompt');
      const yesBtn =  prompt.querySelector('.yes');
      await fireEvent.click(yesBtn);
    });

    test('evidence Form submit', async () => {
      await act(async () => {
        await customRender(<IrInput />, { providerProps });
      });
      const evidenceForm = screen.getByTestId('EvidenceForm');
      const combobox = evidenceForm.querySelectorAll('[data-testid="combobox-container"] .field');
      await fireEvent.click(combobox[0]);
      const comboboxOptions = document.querySelectorAll('.modal ul li');
      await fireEvent.click(comboboxOptions[0]);
      await fireEvent.keyDown(combobox[0], { keyCode: 27 });
      await fireEvent.click(combobox[1]);
      const comboboxOptions2 = document.querySelectorAll('.modal ul li');
      await fireEvent.click(comboboxOptions2[0]);
      await act(async () => {
        const eviDesc = evidenceForm.querySelector('textarea');
        await fireEvent.input(eviDesc, { target: { value: 'testing' } });
      });
      await act(async () => {
        const dateTime = evidenceForm.querySelector('input[type="datetime-local"]');
        await fireEvent.change(dateTime, { target: { value: '2018-06-07T00:00' } });
      });
      setMockFetch({id: 1});
      await act(async () => {
        const submitBtn = evidenceForm.querySelector('button[type="submit"]');
        await fireEvent.click(submitBtn);
      });
    });

    test('RecordInputForm submit', async () => {
      await act(async () => {
        await customRender(<IrInput />, { providerProps });
      });
      const recordInputBtn = screen.getByText('Record Inputs');
      await fireEvent.click(recordInputBtn);
      const recordInputForm = screen.getByTestId('RecordInputForm');
      const combobox = recordInputForm.querySelectorAll('[data-testid="combobox-container"] .field');
      await fireEvent.click(combobox[0]);
      const comboboxOptions = document.querySelectorAll('.modal ul li');
      await fireEvent.click(comboboxOptions[0]);
      await fireEvent.keyDown(combobox[0], { keyCode: 27 });
      await fireEvent.click(combobox[1]);
      const comboboxOptions2 = document.querySelectorAll('.modal ul li');
      await fireEvent.click(comboboxOptions2[0]);
      await act(async () => {
        const eviDesc = recordInputForm.querySelector('textarea');
        await fireEvent.input(eviDesc, { target: { value: 'testing' } });
      });
      await act(async () => {
        const eviDesc = recordInputForm.querySelector('input[type="text"]');
        await fireEvent.input(eviDesc, { target: { value: 'testing' } });
      });
      await act(async () => {
        const dateTime = recordInputForm.querySelector('input[type="datetime-local"]');
        await fireEvent.change(dateTime, { target: { value: '2018-06-07T00:00' } });
      });
      await act(async () => {
        const submitBtn = recordInputForm.querySelector('button[type="submit"]');
        await fireEvent.click(submitBtn);
      });
    });

    test('RecordInputForm close', async () => {
      await act(async () => {
        await customRender(<IrInput />, { providerProps });
      });
      const recordInputBtn = screen.getByText('Record Inputs');
      await fireEvent.click(recordInputBtn);
      const recordInputForm = screen.getByTestId('RecordInputForm');
      await act(async () => {
        const closeBtn = recordInputForm.querySelector('button[type="button"]');
        await fireEvent.click(closeBtn);
      });
    });

    test('RequestInputForm submit', async () => {
      await act(async () => {
        await customRender(<IrInput />, { providerProps });
      });
      const reqInputBtn = screen.getByText('Request for Input');
      await fireEvent.click(reqInputBtn);
      const reqInputForm = screen.getByTestId('RequestInputForm');
      const select = screen.getAllByRole('combobox');
      await act(async () => {
        await fireEvent.keyDown(select[1], { keyCode: 38 });
        await fireEvent.keyDown(select[1], { keyCode: 32 });
      });
      await act(async () => {
        await fireEvent.keyDown(select[0], { keyCode: 38 });
        await fireEvent.keyDown(select[0], { keyCode: 32 });
      });
      const combobox = reqInputForm.querySelectorAll('[data-testid="combobox-container"] .field');
      await fireEvent.click(combobox[0]);
      const comboboxOptions = document.querySelectorAll('.modal ul li');
      await fireEvent.click(comboboxOptions[0]);
      await fireEvent.keyDown(combobox[0], { keyCode: 27 });
      await act(async () => {
        const eviDesc = reqInputForm.querySelector('textarea');
        await fireEvent.input(eviDesc, { target: { value: 'testing' } });
      });
      await act(async () => {
        const submitBtn = reqInputForm.querySelector('button[type="submit"]');
        await fireEvent.click(submitBtn);
      });
    });

    test('RequestInputForm close', async () => {
      await act(async () => {
        await customRender(<IrInput />, { providerProps });
      });
      const recordInputBtn = screen.getByText('Request for Input');
      await fireEvent.click(recordInputBtn);
      const reqInputForm = screen.getByTestId('RequestInputForm');
      await act(async () => {
        const closeBtn = reqInputForm.querySelector('button[type="button"]');
        await fireEvent.click(closeBtn);
      });
    });
});