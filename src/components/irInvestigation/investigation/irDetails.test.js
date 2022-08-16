import { act, fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from "react-router-dom";
import { SiteContext, IrDashboardContext } from "../../../SiteContext";
import { InvestigationContext } from "../InvestigationContext";
import ReactDOM from "react-dom";
import { mockData as data, irContextData, setMockFetch, setMockFailFetch, providerProps, investigationContext } from "../../../config/mocks";
import userEvent from '@testing-library/user-event';
import IrDetails from './irDetails';

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

describe("irDeatis", () => {
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
        await customRender(<IrDetails />, { providerProps });
        expect(document.querySelector('.irDetails')).toBeInTheDocument();
    });

    test('show similarIncidents modal', async () => {
      await customRender(<IrDetails />, { providerProps });
      const modelLink = document.querySelector('form.similarIncidents a');
      await fireEvent.click(modelLink);
      await act(async () => {
        expect(screen.getByTestId('SimilarIncidents')).toBeInTheDocument();
      });
      const simInput = screen.getByLabelText('Add similar incident');
      await fireEvent.change(simInput, {target: {value: 'test'}});
      await act(async () => {
        expect(simInput.value).toEqual('test');
      });
    });

    test('similarIncidents modal switch tab', async () => {
      await customRender(<IrDetails />, { providerProps });
      const modelLink = document.querySelector('form.similarIncidents a');
      await fireEvent.click(modelLink);
      const tabs = document.querySelectorAll('[data-testid="tabs"] a');
      await fireEvent.click(tabs[1]);
      await act(async () => {
        expect(tabs[1]).toHaveClass('active');
      });
      await fireEvent.click(document.querySelector('.collapsableSection .btn.clear'));
    });

    test('NoteForm submit', async () => {
      await customRender(<IrDetails />, { providerProps });
      const noteForm = screen.getByTestId('NoteForm');
      await act(async () => {
        const notes = noteForm.querySelector('input[type="text"]');
        await userEvent.type(notes, 'testing');
        await userEvent.type(notes, "{enter}");
      });
      await act(async () => {
        const dateTime = noteForm.querySelector('input[type="datetime-local"]');
        await userEvent.type(dateTime, '2018-06-07T00:0');
        await userEvent.type(dateTime, "{enter}");
      });
      await act(async () => {
        const submitBtn = noteForm.querySelector('button[type="submit"]');
        await fireEvent.click(submitBtn);
      });
    });

    test('Notes action plans table edit', async () => {
      await customRender(<IrDetails />, { providerProps });
      const editBtn = document.querySelector('.notesWrapper button[title="Edit"]');
      await fireEvent.click(editBtn);
      const PreventiveActionPlansFormClose = screen.getByTestId('NoteFormClose');
      await act(async () => {
          expect(PreventiveActionPlansFormClose).toBeInTheDocument();
      });
      await fireEvent.click(PreventiveActionPlansFormClose);
  });

  test('Notes action plans table delete', async () => {
      await customRender(<IrDetails />, { providerProps });
      const deleteBtn = document.querySelector('.notesWrapper button[title="Delete"]');
      await fireEvent.click(deleteBtn);
      await act(async () => {
          expect(screen.getByTestId('prompt')).toBeInTheDocument();
      });
  });

  test('Notes action plans table delete confirm', async () => {
      await customRender(<IrDetails />, { providerProps });
      const deleteBtn = document.querySelector('.notesWrapper button[title="Delete"]');
      await fireEvent.click(deleteBtn);
      const prompt = screen.getByTestId('prompt');
      const yesBtn =  prompt.querySelector('.yes');
      await fireEvent.click(yesBtn);
      const radio = document.querySelector(`input[name='selfRep']`);
      fireEvent.change(radio, { target: { value: true } });
      await act(async () => {
        expect(radio.value).toBe('true');
      });
  });

  test('EventForm submit', async () => {
    await customRender(<IrDetails />, { providerProps });
    const eventForm = screen.getByTestId('EventForm');
    await act(async () => {
      const notes = eventForm.querySelector('input[type="text"]');
      await userEvent.type(notes, 'testing');
      await userEvent.type(notes, "{enter}");
    });
    await act(async () => {
      const dateTime = eventForm.querySelector('input[type="datetime-local"]');
      await fireEvent.change(dateTime, { target: { value: '2018-06-07T00:00' } });
    });
    await act(async () => {
      const submitBtn = eventForm.querySelector('button[type="submit"]');
      await fireEvent.click(submitBtn);
    });
  });

  test('Event action plans table edit', async () => {
    await customRender(<IrDetails />, { providerProps });
    const editBtn = document.querySelector('.tableOfEvents button[title="Edit"]');
    await fireEvent.click(editBtn);
    const PreventiveActionPlansFormClose = screen.getByTestId('EventFormClose');
    await act(async () => {
        expect(PreventiveActionPlansFormClose).toBeInTheDocument();
    });
    const eventForm = screen.getByTestId('EventForm');
    await act(async () => {
      const notes = eventForm.querySelector('input[type="text"]');
      await userEvent.type(notes, 'testing');
      await userEvent.type(notes, "{enter}");
    });
    await act(async () => {
      const dateTime = eventForm.querySelector('input[type="datetime-local"]');
      await fireEvent.change(dateTime, { target: { value: '2018-06-07T00:00' } });
    });
    await act(async () => {
      const submitBtn = eventForm.querySelector('button[type="submit"]');
      await fireEvent.click(submitBtn);
    });
    await fireEvent.click(PreventiveActionPlansFormClose);
  });

  test('Event action plans table delete', async () => {
    await customRender(<IrDetails />, { providerProps });
    const deleteBtn = document.querySelector('.tableOfEvents button[title="Delete"]');
    await fireEvent.click(deleteBtn);
    await act(async () => {
        expect(screen.getByTestId('prompt')).toBeInTheDocument();
    });
    const clearBtn = document.querySelector('.tableOfEvents .dscr .btn.clear');
    await fireEvent.click(clearBtn);
  });

  test('Event action plans table delete confirm', async () => {
    await customRender(<IrDetails />, { providerProps });
    const deleteBtn = document.querySelector('.tableOfEvents button[title="Delete"]');
    await fireEvent.click(deleteBtn);
    const prompt = screen.getByTestId('prompt');
    const yesBtn =  prompt.querySelector('.yes');
    await fireEvent.click(yesBtn);
  });

  test('empty investigation data', async () => {
    const ir = {
      ...investigationContext,
      ir: {
        ...investigationContext.ir,
        irInvestigation: []
      },
      setIr: jest.fn()
    };
    await customRender(<IrDetails />, { providerProps, investigationContextProps: ir });
  });
});