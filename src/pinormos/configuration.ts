const basicCommonWidgets = [
  'AsicProgrammer User Guide',
  'Connection',
  'Documentation',
  'DSDK Confluence',
  'DSDK Jira',
  'DSDK Update',
  'Erase and Program',
  'README',
  'TouchComm User Guide'
];

const basicTouchAssessmentWidgets = [
  'ADC Data',
  'Lockdown And Custom Serialization',
  'Production Tests',
  'RAM Backdoor',
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
    'Library',
    'Local CBC and CSat',
    'PDNR',
    'Reflash',
    'Sensor Mapping'
  ],
  SB7900: [
    ...basicCommonWidgets,
    'Device Info',
    'Register Map',
    'Local Dimming',
    'Trace and Log'
  ],
  invalid: [...basicCommonWidgets]
};
