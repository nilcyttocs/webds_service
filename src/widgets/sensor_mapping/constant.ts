export const extensionConst = {
  partNumber: {
    keys: ["s3913"],
    rio: ["s3908", "s3909"],
    juneau: ["s3910"]
  },
  bankingScheme: {
    jira: "https://jira.synaptics.com/browse/SWDS6-3451",
    keys: {
      Banking: {
        BK4: "TRX[29:22]",
        BK3: "TRX[21:20]",
        BK2: "TRX[19:10]",
        BK1: "TRX[9:8]",
        BK0: "TRX[7:0]",
        BK7: "TRX[59:50]",
        BK6: "TRX[49:40]",
        BK5: "TRX[39:30]"
      },
      "axis-sense": [
        {
          id: "0",
          mapping: ["Tx", "Tx", "Tx", "Tx", "Tx", "Tx", "Tx", "Tx"]
        },
        {
          id: "1",
          mapping: ["Rx", "Rx", "Rx", "Tx", "Tx", "Tx", "Rx", "Rx"]
        },
        {
          id: "2",
          mapping: ["Tx", "Tx", "Tx", "Rx", "Rx", "Rx", "Tx", "Tx"]
        },
        {
          id: "3",
          mapping: ["Tx", "Tx", "Rx", "Rx", "Rx", "Rx", "Rx", "Tx"]
        },
        {
          id: "4",
          mapping: ["Rx", "Rx", "Tx", "Tx", "Tx", "Tx", "Tx", "Rx"]
        },
        {
          id: "5",
          mapping: ["Rx", "Rx", "Rx", "Rx", "Tx", "Tx", "Rx", "Rx"]
        },
        {
          id: "6",
          mapping: ["Tx", "Tx", "Tx", "Tx", "Rx", "Rx", "Tx", "Tx"]
        },
        {
          id: "7",
          mapping: ["Tx", "Rx", "Rx", "Rx", "Rx", "Rx", "Rx", "Tx"]
        },
        {
          id: "8",
          mapping: ["Rx", "Tx", "Tx", "Tx", "Tx", "Tx", "Tx", "Rx"]
        }
      ],
      exclusive: [
        ["BK0", "BK4"],
        ["BK5", "BK7"]
      ]
    },
    rio: {
      Banking: {
        BK2: "TRX[29:20]",
        BK1: "TRX[19:10]",
        BK0: "TRX[9:0]",
        BK5: "TRX[59:50]",
        BK4: "TRX[49:40]",
        BK3: "TRX[39:30]"
      },
      "axis-sense": [
        {
          id: "0x00",
          mapping: ["Tx", "Tx", "Tx", "Tx", "Tx", "Tx"]
        },
        {
          id: "0x1E",
          mapping: ["Rx", "Rx", "Tx", "Tx", "Rx", "Rx"]
        },
        {
          id: "0x21",
          mapping: ["Tx", "Tx", "Rx", "Rx", "Tx", "Tx"]
        },
        {
          id: "0x33",
          mapping: ["Tx", "Rx", "Rx", "Rx", "Rx", "Tx"]
        },
        {
          id: "0x0C",
          mapping: ["Rx", "Tx", "Tx", "Tx", "Tx", "Rx"]
        },
        {
          id: "0x36",
          mapping: ["Tx", "Rx", "Rx", "Tx", "Rx", "Rx"]
        },
        {
          id: "0x1B",
          mapping: ["Rx", "Rx", "Tx", "Rx", "Rx", "Tx"]
        }
      ]
    },
    juneau: {
      jira: "https://jira.synaptics.com/browse/SWDS6-3159",
      Banking: {
        BK2: "TRX[29:20]",
        BK1: "TRX[19:10]",
        BK0: "TRX[9:0]",
        BK5: "TRX[59:50]",
        BK4: "TRX[49:40]",
        BK3: "TRX[39:30]"
      },
      "axis-sense": [
        {
          id: "0",
          mapping: ["Tx", "Tx", "Tx", "Tx", "Tx", "Tx"]
        },
        {
          id: "1",
          mapping: ["Rx", "Rx", "Tx", "Tx", "Rx", "Rx"]
        },
        {
          id: "2",
          mapping: ["Tx", "Tx", "Rx", "Rx", "Tx", "Tx"]
        },
        {
          id: "3",
          mapping: ["Tx", "Rx", "Rx", "Rx", "Rx", "Tx"]
        },
        {
          id: "4",
          mapping: ["Rx", "Tx", "Tx", "Tx", "Tx", "Rx"]
        }
      ]
    },
    temp: {
      Banking: {
        BK2: "TRX[29:20]",
        BK1: "TRX[19:10]"
      },
      "axis-sense": [
        {
          id: "0x00",
          mapping: ["Tx", "Tx", "Tx", "Tx", "Tx", "Tx"]
        },
        {
          id: "0x1E",
          mapping: ["Rx", "Rx", "Tx", "Tx", "Rx", "Rx"]
        }
      ]
    }
  },
  steps: 4,
  buttonApplyId: "button-stepper-apply"
};
