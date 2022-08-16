import { act, render, screen } from '@testing-library/react';
import { mockData as data, providerProps } from "../../config/mocks";
import {InvestigationProvider} from './InvestigationContext';
import { SiteContext } from "../../SiteContext";

const setMockFetch = (data, status) => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      json: jest.fn()
        .mockResolvedValueOnce({...data, status: 3})
        .mockResolvedValue(data),
      status: status || 200,
    });
};

const customRender = async (ui) => {
    return await act(async () => {
        await render(
            <SiteContext.Provider value={providerProps}>
                <InvestigationProvider>
                    {ui}
                </InvestigationProvider>
            </SiteContext.Provider>
          );
    });
};

describe("InvestigationProvider", () => {
    beforeAll(() => {
    });
    beforeEach(async () => {
      setMockFetch({
        id: data.id,
        irInvestigation: data.irInvestigation,
        status: data.status
      });
    });
  
    test('render correctly', async () => {
      await customRender(<div>test</div>);
      expect(screen.getByText('test')).toBeInTheDocument();
    });
});