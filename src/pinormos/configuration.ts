const basicCommonWidgets = [
  'AsicProgrammer User Guide',
  'Connection',
  'Documentation',
  'DSDK Confluence',
  'DSDK Jira',
  'DSDK Update',
  'Erase and Program',
  'Library',
  'README',
  'TouchComm User Guide'
];

const basicTouchAssessmentWidgets = [
  'ADC Data',
  'Production Tests',
  'Test Data Collection',
  'Test Data Viewer',
  'Touch Data'
];

export const widgetSets = {
  'S3908,S3910,S3913,S3916,S3920': [
    ...basicCommonWidgets,
    ...basicTouchAssessmentWidgets,
    'Configuration Editor',
    'Device Info',
    'Gear Selection',
    'Guided',
    'Hybrid Analog',
    'Integration Duration',
    'Local CBC and CSat',
    'Reflash',
    'Sensor Mapping'
  ],
  SB7900: [...basicCommonWidgets, 'Register Map', 'Trace and Log'],
  invalid: [...basicCommonWidgets]
};
