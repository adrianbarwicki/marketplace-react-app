import React from 'react';
import CodeEditor from './Components/CodeEditor';
import ConfigEdit from './Components/ConfigEdit';

const landingPageFields = [
    {
        type: 'bool',
        key: 'LANDING_PAGE_DEMAND_SECTION_CATEGORIES_ENABLED',
        label: "Enable categories' section"
    },
    {
        type: 'bool',
        key: 'LANDING_PAGE_DEMAND_SECTION_HOW_IT_WORKS_ENABLED',
        label: "Enable 'How it Works' section"
    }
];

export default class SectionLandingPage extends React.Component {
    render() {
        return (
            <div className="row">
                <ConfigEdit
                    header={'Landing page template sections'}
                    desc={'You can use pre-configured templates to include on the landing page.'}
                    fields={landingPageFields}
                />

                <div className="row">
                    <h1>Custom HTML for Demand Side (Buyers, Clients)</h1>
                    <hr />
                    <p className="text-muted">
                        This HTML is injected inside the client page and can be used to insert custom defined HTML. Please note that future changes to VQ-MARKETPLACE may render your HTML incompatible.
                    </p>

                    <CodeEditor postKey={"LANDING_PAGE"} />
                </div>
                <hr />
                <div className="row" style={{ marginTop: 30 }}>
                    <h1>Custom HTML for Supply Side (Sellers, Providers)</h1>
                    

                    <CodeEditor postKey={"LANDING_PAGE_PROVIDERS"} />
                </div>
            </div>
        );
    }
}
