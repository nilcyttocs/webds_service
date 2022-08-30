import React, { useEffect, useState, useRef } from "react";

import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepContent from "@mui/material/StepContent";

import {
  Stack,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  Button,
  Avatar,
  Typography,
  Snackbar,
  Alert,
  InputBase,
  styled
} from "@mui/material";

import BankingScheme from "./bankingScheme";
import { extensionConst } from "./constant";

import { requestAPI } from "../../handler";

import DoneIcon from "@mui/icons-material/Done";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";

interface IAxis {
  dir: number[];
  count: number;
  dim: number;
  bk: number[];
}

interface IMappingInfo {
  status: boolean;
  info: string;
  content: number[];
}

interface IBankingSchemeUnit {
  id: string;
  tx: number[];
  rx: number[];
}

interface ISteppr {
  updateX: any;
  updateY: any;
  updateStep: any;
  updateAxis: any;
  step: any;
  service: any;
  updateStatus: any;
  updateInitState: any;
}

interface IAlertInfo {
  state: boolean;
  message: string;
  severity: "error" | "info" | "success" | "warning";
}

interface IApplyParam {
  txCount: string;
  rxCount: string;

  imageRxes: number[];
  imageTxes: number[];

  txAxis: string;
}

const BankingInput = styled(InputBase)(({ theme }) => ({
  "label + &": {
    marginTop: theme.spacing(3)
  },
  "& .MuiInputBase-input": {
    borderRadius: 4,
    position: "relative",
    backgroundColor: "transparent",
    border: "0px solid #ced4da",
    fontSize: 12,
    width: 450,
    padding: "0px 0px",
    transition: theme.transitions.create([
      "border-color",
      "background-color",
      "box-shadow"
    ]),
    // Use the system font instead of the default Roboto font.
    fontFamily: ["-apple-system", "BlinkMacSystemFont", '"Segoe UI"'].join(",")
  }
}));

export default function VerticalStepper(props: ISteppr) {
  const [activeStep, setActiveStep] = React.useState(props.step);
  const [stepStatus, setStepStatus] = useState(
    Array(extensionConst.steps).fill(0)
  );

  const [txCount, setTxCount] = useState("0");
  const [rxCount, setRxCount] = useState("0");
  const [txCountError, setTxCountError] = useState(false);
  const [rxCountError, setRxCountError] = useState(false);
  const [txErrorInfo, setTxErrorInfo] = useState("");
  const [rxErrorInfo, setRxErrorInfo] = useState("");
  const [txError, setTxError] = useState(false);
  const [rxError, setRxError] = useState(false);
  const [txMappingBase, setTxMappingBase] = useState("");
  const [rxMappingBase, setRxMappingBase] = useState("");
  const [xdir, setXdir] = useState<number[]>([]);
  const [ydir, setYdir] = useState<number[]>([]);
  const [xTrx, setXTrx] = useState("");
  const [defaultSelect, setDefaultSelect] = useState("");
  const [initState, setInitState] = useState(false);

  const [bankingListAll, setBankingListAll] = useState([]);
  const [bankingSchemeConfig, setBankingSchemeConfig] = useState([]);

  const [needReset, setNeedReset] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [openAlert, setOpenAlert] = useState<IAlertInfo>({
    state: false,
    message: "",
    severity: "info"
  });

  const applyParam = useRef<IApplyParam>({
    txCount: "0",
    rxCount: "0",
    imageRxes: [],
    imageTxes: [],
    txAxis: ""
  });

  const asic = useRef("");
  const xTrxRef = useRef("");
  const bklist = useRef<IBankingSchemeUnit[]>([]);
  const txData = useRef<IAxis>({
    dir: [],
    count: 0,
    dim: 0,
    bk: [...Array(100).keys()]
  });
  const rxData = useRef<IAxis>({
    dir: [],
    count: 0,
    dim: 0,
    bk: [...Array(100).keys()]
  });

  //const webdsTheme = props.service.ui.getWebDSTheme();

  useEffect(() => {
    setActiveStep(props.step);
  }, [props.step]);

  useEffect(() => {
    if (needReset) {
      let newStatus = Array(extensionConst.steps).fill(0);
      setStepStatus(newStatus);
      setNeedReset(false);
    }
  }, [txCount, rxCount, xdir, ydir]);

  useEffect(() => {
    props.updateInitState(initState);
  }, [initState]);

  useEffect(() => {
    if (txCountError || rxCountError || txError || rxError || !dataReady) {
      props.updateStatus(true);
    } else {
      props.updateStatus(false);
    }
  }, [txCountError, rxCountError, txError, rxError, props, dataReady]);

  const Identify = async (): Promise<string> => {
    let partNumber: string = "none";
    let fw_mode: string = "none";

    try {
      const reply = await requestAPI<any>("command?query=identify", {
        method: "GET"
      });

      fw_mode = reply["mode"];
      if (fw_mode === "application") {
        console.log("appliction mode");
        partNumber = reply["partNumber"];
        return Promise.resolve(partNumber);
      } else {
        return Promise.reject(`invalid fw mode: ${fw_mode}`);
      }
    } catch (error) {
      console.log(error);
      return Promise.reject(`identify failed: ${error.toString()}`);
    }

    return Promise.resolve(partNumber);
  };

  const Get = async (): Promise<string | undefined> => {
    try {
      let url = "config/static";

      const reply = await requestAPI<any>(url, {
        method: "GET"
      });

      //console.log(reply);
      return Promise.resolve(JSON.stringify(reply));
    } catch (e) {
      console.error(`Error on POST.\n${e}`);
      return Promise.reject((e as Error).message);
    }
  };

  const WriteToRAM = async (dataToSend: any): Promise<string | undefined> => {
    try {
      const reply = await requestAPI<any>("config/static", {
        body: JSON.stringify(dataToSend),
        method: "POST"
      });
      console.log(reply);
      return Promise.resolve(JSON.stringify(reply));
    } catch (e) {
      console.error(`Error on POST ${dataToSend}.\n${e}`);
      ///qmao return Promise.reject((e as Error).message);
      return Promise.resolve(JSON.stringify(""));
    }
  };

  const WriteToFlash = async (): Promise<string | undefined> => {
    try {
      var dataToSend = {
        command: "commitConfig"
      };
      const reply = await requestAPI<any>("command", {
        body: JSON.stringify(dataToSend),
        method: "POST"
      });

      return Promise.resolve(JSON.stringify(reply));
    } catch (e) {
      console.error(`Error on POST ${dataToSend}.\n${e}`);
      return Promise.reject((e as Error).message);
    }
  };

  const updatexTrxRef = (data: string) => {
    xTrxRef.current = data;
    setXTrx(data);
    if (data === "TX") {
      setYdir(rxData.current.dir);
      setXdir(txData.current.dir);
    } else if (data === "RX") {
      setXdir(rxData.current.dir);
      setYdir(txData.current.dir);
    }
    props.updateAxis(data === "TX");
  };

  useEffect(() => {
    props.updateX(xdir);
  }, [xdir]);

  useEffect(() => {
    props.updateY(ydir);
  }, [ydir]);

  function handleStep(step: number) {
    setActiveStep(step);
    props.updateStep(step);
  }

  const updateTxDir = (data: number[]) => {
    txData.current.dir = data;
    if (xTrxRef.current === "TX") {
      setXdir(data);
    } else if (xTrxRef.current === "RX") {
      setYdir(data);
    }
  };

  const updateRxDir = (data: number[]) => {
    rxData.current.dir = data;
    if (xTrxRef.current === "TX") {
      setYdir(data);
    } else if (xTrxRef.current === "RX") {
      setXdir(data);
    }
  };

  const checkInputMappingIsValid = (mapping: string) => {
    var ret = {} as IMappingInfo;
    ret.status = false;
    ret.info = "";

    var user = [];
    if (mapping.length !== 0) {
      try {
        user = mapping.split(",").map(function (item) {
          return parseInt(item, 10);
        });
      } catch (error) {
        ret.status = true;
        ret.info = mapping + " parse failed";
      }
    }

    //const found = user.includes(NaN);
    let index = user.findIndex(Number.isNaN);

    if (index !== -1) {
      ret.status = true;
      ret.info = "Invalid value at index " + index;
    }
    ret.content = user;
    return ret;
  };

  const CheckMappingCount = (data: IAxis) => {
    var ret: IMappingInfo = { status: false, info: "", content: [] };

    if (data.dir.length !== data.count) {
      ret.info = "count " + data.dir.length + " not match " + data.count;
      ret.status = true;
    }

    if (data.dir.length > data.dim) {
      ret.info = "count " + data.dir.length + " over dimension " + data.dim;
      ret.status = true;
    }
    return ret;
  };

  const CheckMappingRule = (data: IAxis) => {
    var ret = {} as IMappingInfo;
    var singleCheck = [];
    ret.status = false;
    ret.info = "";
    var BreakException = {};

    try {
      data.dir.forEach((value) => {
        if (value === 0) {

        }
        else
        {
          if (!data.bk.includes(value)) {
            ret.info = "Invalid " + value.toString();
            ret.status = true;
            throw BreakException;
          }

          if (singleCheck.includes(value)) {
            ret.info = "mutilple " + value.toString();
            ret.status = true;
            throw BreakException;
          }
          singleCheck.push(value);
        }
      });
    } catch (e) {
      return ret;
    }

    if (data.dir.length > data.bk.length) {
      ret.info = data.dir.length + " over dim" + data.bk.length;
      ret.status = true;
      return ret;
    }

    ret = CheckMappingCount(data);

    return ret;
  };

  const updateTxMapping = (mapping: string) => {
    setTxMappingBase(mapping);

    var ret = checkInputMappingIsValid(mapping);
    updateTxDir(ret.content);

    ret = CheckMappingRule(txData.current);
    setTxError(ret.status);
    setTxErrorInfo(ret.info);
  };

  const updateRxMapping = (mapping: string) => {
    setRxMappingBase(mapping);

    var ret = checkInputMappingIsValid(mapping);
    updateRxDir(ret.content);

    ret = CheckMappingRule(rxData.current);
    setRxError(ret.status);
    setRxErrorInfo(ret.info);
  };

  const updateTxCount = (data: string) => {
    setTxCount(data);
    let num = parseInt(data, 10);
    if (isNaN(num) || isNaN(Number(data)) || num < 0) {
      setTxCountError(true);
      txData.current.count = -1;
    } else {
      setTxCountError(false);
      txData.current.count = num;
    }
  };

  const updateRxCount = (data: string) => {
    setRxCount(data);
    let num = parseInt(data, 10);
    if (isNaN(num) || isNaN(Number(data)) || num < 0) {
      setRxCountError(true);
      rxData.current.count = -1;
    } else {
      setRxCountError(false);
      rxData.current.count = num;
    }
  };

  const updateTxDefaultList = (data: number[]) => {
    txData.current.bk = data;
    //do not update tx count when select banking
    //updateTxCount(data.length.toString());
    updateTxMapping(data.toString());
  };

  const updateRxDefaultList = (data: number[]) => {
    rxData.current.bk = data;
    //do not update rx count when select banking
    //updateRxCount(data.length.toString());
    updateRxMapping(data.toString());
  };

  const handleTxCount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTxCount(event.target.value);
  };

  const handleTxCountBlur = (value: string) => {
    updateTxCount(value);

    var ret = CheckMappingCount(txData.current);

    setTxError(ret.status);
    setTxErrorInfo(ret.info);
  };

  const handleRxCount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRxCount(event.target.value);
  };

  const handleRxCountBlur = (value: string) => {
    updateRxCount(value);
    var ret = CheckMappingCount(rxData.current);
    setRxError(ret.status);
    setRxErrorInfo(ret.info);
  };

  const handleSelectBankingScheme = (
    select: any,
    config: any,
    updateMapping: boolean
  ) => {
    if (updateMapping) {
      if (select === 0) {
        updateTxDefaultList([...Array(100).keys()]);
        updateRxDefaultList([...Array(100).keys()]);
        return;
      }

      var unit = bklist.current.find((item) => item.id === select);

      updateTxDefaultList(unit.tx);
      updateRxDefaultList(unit.rx);

      handleTxCountBlur(unit.tx.length.toString());
      handleRxCountBlur(unit.rx.length.toString());

      setDefaultSelect(select);
    }
  };

  const handleTxMapping = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTxMappingBase(event.target.value);
  };

  const handleTxMappingBlur = () => {
    updateTxMapping(txMappingBase);
  };

  const handleRxMappingBlur = () => {
    updateRxMapping(rxMappingBase);
  };

  const handleRxMapping = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRxMappingBase(event.target.value);
  };

  const findDuplicatesCount = (array1: number[], array2: number[]) => {
    var duplicates = array1.filter(function (val) {
      return array2.indexOf(val) != -1;
    });
    return duplicates.length;
  };

  const findMatchBankingScheme = (tx: number[], rx: number[]) => {
    const match = bklist.current.map((item) => {
      var txMatch = findDuplicatesCount(item.tx, tx);
      var rxMatch = findDuplicatesCount(item.rx, rx);
      return txMatch + rxMatch;
    });

    if (match.length === 0) return;

    const max = Math.max(...match);
    const index = match.indexOf(max);

    txData.current.bk = bklist.current[index].tx;
    rxData.current.bk = bklist.current[index].rx;

    setDefaultSelect(bklist.current[index].id);
  };

  const handleBankingSchemeInit = (bkList: any, config: any) => {
    console.log("bkList", bkList);
    console.log("config", config);

    for (const [key, kvalue] of Object.entries(config)) {
      var trx_list = kvalue["list"];

      var unit: IBankingSchemeUnit = { id: "", tx: [], rx: [] };
      unit.id = key;

      trx_list.forEach((value, index) => {
        var ret = value.split(/\[|\]|:/);
        var name = ret[0];
        var range1 = parseInt(ret[1], 10);
        var range2 = parseInt(ret[2], 10);
        var len = range1 - range2 + 1;
        var nlist: number[] = Array.from({ length: len }, (_, i) => i + range2);

        if (name === "Tx") {
          unit.tx = unit.tx.concat(nlist);
        } else if (name === "Rx") {
          unit.rx = unit.rx.concat(nlist);
        }
      });
      bklist.current.push(unit);
    }
  };

  function updateLatestStatus() {
    //update latest param for tracking
    applyParam.current.txCount = txData.current.dir.length.toString();
    applyParam.current.rxCount = rxData.current.dir.length.toString();
    applyParam.current.imageTxes = txData.current.dir;
    applyParam.current.imageRxes = rxData.current.dir;
    applyParam.current.txAxis = xTrxRef.current;
  }

  const initSensorMapping = async () => {
	props.service.packrat.cache.addPrivateConfig()
		.then((ret) => {
			console.log(ret);
			setOpenAlert({ state: true, severity: 'success', message: ret.toString() });
		})
		.then(() => Get())
		.then((ret) => {
			let config = JSON.parse(ret);
			var txlen = config["txCount"];
			var rxlen = config["rxCount"];
			var tx = config["imageTxes"];
			var rx = config["imageRxes"];

			findMatchBankingScheme(tx, rx);

			updatexTrxRef(config["txAxis"] ? "RX" : "TX" );

			updateTxCount(txlen.toString());
			updateRxCount(rxlen.toString());

			txData.current.dim = tx.length;
			rxData.current.dim = rx.length;

			updateTxMapping(tx.slice(0, txlen).toString());
			updateRxMapping(rx.slice(0, rxlen).toString());

			setDataReady(true);
		})
		.catch(err => {
			console.log(err);
			setOpenAlert({ state: true, severity: 'error', message: err.toString() });
			return;
		})
		.finally(() => {
		   updateLatestStatus();
		   setInitState(true);
		})
  };

  const initialize = async () => {
    await Identify()
      .then((partNumber) => {
        console.log(partNumber);
        for (const [key, value] of Object.entries(extensionConst.partNumber)) {
          console.log(key, value);
          const match = value.find((element) => {
            if (partNumber.includes(element)) {
              asic.current = key;
              return true;
            }
          });
          console.log(match);
        }

        if (asic.current === "") {
          console.log("asic not found");
          return;
        }

        var banking_field = Object.keys(
          extensionConst.bankingScheme[asic.current]["Banking"]
        );
        var title = Object.values(
          extensionConst.bankingScheme[asic.current]["Banking"]
        );
        var pin = [];

        title.map((value: any) => {
          pin.push(value.slice(3));
        });

        var axis_sense =
          extensionConst.bankingScheme[asic.current]["axis-sense"];
        var row = [];
        var trx_select = {};
        axis_sense.forEach(function (item) {
          var r = {};
          r["id"] = item["id"];

          item["mapping"].forEach(function (bk, index) {
            r[banking_field[index]] = bk;
          });

          //append pin range to TxRx text
          var trx = Object.values(r).slice(1);
          var tx_count = 0;
          var rx_count = 0;
          trx.forEach((element, index) => {
            trx[index] = element + pin[index];

            var ret = pin[index].split(/\[|\]|:/);
            var range1 = parseInt(ret[1], 10);
            var range2 = parseInt(ret[2], 10);
            var len = range1 - range2 + 1;
            if (element === "Tx") {
              tx_count = tx_count + len;
            } else {
              rx_count = rx_count + len;
            }
          });
          trx_select[r["id"]] = {};
          trx_select[r["id"]]["list"] = trx;
          trx_select[r["id"]]["count"] = [tx_count, rx_count];

          row.push(r);
        });
        setBankingSchemeConfig(JSON.parse(JSON.stringify(trx_select)));
        setBankingListAll(row);

        handleBankingSchemeInit(row, trx_select);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  async function init() {
    await initialize();
    await initSensorMapping();
  }

  useEffect(() => {
    init();
  }, []);

  const handleAxesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updatexTrxRef(event.target.value);
  };

  function displayTxRxCount() {
    return (
      <Stack spacing={5} justifyContent="flex-start" direction="row">
        <TextField
          label="Number Tx"
          id="standard-size-txcount"
          variant="standard"
          value={txCount}
          error={txCountError}
          onChange={handleTxCount}
          onBlur={(e) => handleTxCountBlur(e.target.value)}
          sx={{ width: "15ch" }}
          InputProps={{
            readOnly: false
          }}
          helperText={`Dimension ${txData.current.dim}`}
        />
        <TextField
          label="Number Rx"
          id="standard-size-rxcount"
          variant="standard"
          error={rxCountError}
          value={rxCount}
          onChange={handleRxCount}
          onBlur={(e) => handleRxCountBlur(e.target.value)}
          sx={{ width: "15ch" }}
          InputProps={{
            readOnly: false
          }}
          helperText={`Dimension ${rxData.current.dim}`}
        />
      </Stack>
    );
  }

  function getBankingInputContent() {
    let str = "Banking Range\n";
    if (txData.current.bk.length) {
      str = str + "[TX]" + txData.current.bk.toString() + "\n";
    }

    if (rxData.current.bk.length) {
      str = str + "[RX]" + rxData.current.bk.toString();
    }

    return str;
  }

  function displayTxRxMapping() {
    return (
      <Stack spacing={3}>
        <Stack direction="column" spacing={0}>
          <BankingInput multiline defaultValue={getBankingInputContent()} />
        </Stack>
        <TextField
          id="standard-textarea"
          label="Tx Mapping"
          multiline
          variant="standard"
          value={txMappingBase}
          onChange={handleTxMapping}
          onBlur={handleTxMappingBlur}
          error={txError}
          helperText={txErrorInfo}
        />

        <TextField
          id="standard-textarea"
          label="Rx Mapping"
          multiline
          variant="standard"
          value={rxMappingBase}
          onChange={handleRxMapping}
          onBlur={handleRxMappingBlur}
          error={rxError}
          helperText={rxErrorInfo}
        />
      </Stack>
    );
  }

  async function onApply(event: any) {
    var dataToSend = {};
    let newStatus = Array(extensionConst.steps).fill(0);

    enum StepIndex {
      TxRxNumber = 0,
      Banking,
      TxRxOrder,
      Axes
    }

    if (
      applyParam.current.txCount !== txCount ||
      applyParam.current.rxCount !== rxCount
    ) {
      newStatus[StepIndex.TxRxNumber] = 1;
    }

    if (applyParam.current.txAxis !== xTrxRef.current) {
      newStatus[StepIndex.Axes] = 1;
    }

    if (
      JSON.stringify(applyParam.current.imageRxes) !==
        JSON.stringify(rxData.current.dir) ||
      JSON.stringify(applyParam.current.imageTxes) !==
        JSON.stringify(txData.current.dir)
    ) {
      newStatus[StepIndex.TxRxOrder] = 1;
    }

    let index = parseInt(event.currentTarget.value, 10);
    if (index === StepIndex.Banking) {
      newStatus[StepIndex.Banking] = 1;
    }

    dataToSend = {
      txCount: txCount,
      rxCount: rxCount,

      imageRxes: rxData.current.dir,
      imageTxes: txData.current.dir,
      numColumns: txCount,
      numRows: rxCount,

      txAxis: xTrxRef.current === "TX" ? 0 : 1
    };

    await WriteToRAM(dataToSend)
      .then((ret) => {
        if (index === extensionConst.steps) {
          return WriteToFlash();
        } else return ret;
      })
      .then((ret) => {
        //console.log(ret);
        if (index === extensionConst.steps) {
          //done pass
          let newStatus = Array(extensionConst.steps).fill(0);
          setStepStatus(newStatus);
          setOpenAlert({
            state: true,
            severity: "success",
            message: "Success"
          });

          handleStep(0);
        } else {
          //apply pass
          setStepStatus(newStatus);
          handleStep(index + 1);
          setNeedReset(true);
        }

        updateLatestStatus();
      })
      .catch((e) => {
        if (index === extensionConst.steps) {
          //done fail
          let newStatus = Array(extensionConst.steps).fill(0);
          setStepStatus(newStatus);
        } else {
          //apply fail
          let newStatus = stepStatus;
          newStatus[index] = 0;
          setStepStatus(newStatus);
        }

        setOpenAlert({ state: true, severity: "error", message: e.toString() });
      });
  }

  function displayStepIcon(index: number) {
    let error = false;
    const param = {
      bgcolor: "primary",
      width: 24,
      height: 24,
      mr: 2,
      color: "inherit"
    };

    /*
    if (props.step === extensionConst.steps) {
      //check step finish when DONE
      param.color = "#inherit";
      if (stepStatus[index] === 1) {
        param.bgcolor = "green";
      } else {
        param.bgcolor = "red";
      }
    }
    */

    switch (index) {
      case 0:
        if (txCountError || rxCountError) {
          error = true;
        }
        break;
      case 2:
        if (txError || rxError) {
          error = true;
        }
        break;
      default:
        break;
    }

    if (index === props.step) {
      param.bgcolor = "#007dc3";
    }

    if (stepStatus[index] === 1) {
      param.color = "green";
    }

    if (error) {
      param.bgcolor = "red";
      param.color = "white";
    }

    return (
      <Avatar sx={param}>
        {error ? (
          <PriorityHighIcon sx={{ fontSize: 16 }} />
        ) : stepStatus[index] === 1 ? (
          <DoneIcon sx={{ fontSize: 16 }} />
        ) : (
          <Typography sx={{ fontSize: 14, color: "white" }}>{index}</Typography>
        )}
      </Avatar>
    );
  }

  function displayAxisSelect() {
    return (
      <FormControl>
        <RadioGroup
          name="row-radio-buttons-group"
          value={xTrx}
          onChange={handleAxesChange}
        >
          <Stack direction="row" justifyContent="center" alignItems="center">
            <FormControlLabel value={"TX"} control={<Radio />} label="" />
            <Typography>Tx on X-axis</Typography>
          </Stack>
          <Stack direction="row" justifyContent="center" alignItems="center">
            <FormControlLabel value={"RX"} control={<Radio />} label="" />
            <Typography>Rx on X-axis</Typography>
          </Stack>
        </RadioGroup>
      </FormControl>
    );
  }

  const handleCloseAlert = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenAlert({ ...openAlert, state: false });
  };

  function displayAlert() {
    return (
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right"
        }}
        open={openAlert.state}
        autoHideDuration={3000}
        onClose={handleCloseAlert}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={openAlert.severity}
          sx={{ width: "100%" }}
        >
          {openAlert.message}
        </Alert>
      </Snackbar>
    );
  }

  /*
  function displayBankingPreview() {
    const PREVIEW_LINE_HEIGHT = 0.8;
    const PREVIEW_FONT_SIZE = 12;
    const PREVIEW_STACK_PARAM = { p: 0, b: 0, m: 0 };
    return (
      <Paper
        elevation={0}
        sx={{
          width: 300,
          bgcolor: "transparent",
          overflow: "scroll",
          height: "5vh"
        }}
      >
        <Stack direction="column" sx={{ pl: 3, width: 150 }}>
          <Stack direction="row" spacing={1} sx={PREVIEW_STACK_PARAM}>
            <Typography
              sx={{
                fontSize: PREVIEW_FONT_SIZE,
                lineHeight: PREVIEW_LINE_HEIGHT
              }}
            >
              {"TX"}
            </Typography>
            <Typography
              sx={{
                fontSize: PREVIEW_FONT_SIZE,
                lineHeight: PREVIEW_LINE_HEIGHT
              }}
            >
              {txData.current.bk.toString()}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={PREVIEW_STACK_PARAM}>
            <Typography
              sx={{
                fontSize: PREVIEW_FONT_SIZE,
                lineHeight: PREVIEW_LINE_HEIGHT
              }}
            >
              {"RX"}
            </Typography>
            <Typography
              sx={{
                fontSize: PREVIEW_FONT_SIZE,
                lineHeight: PREVIEW_LINE_HEIGHT
              }}
            >
              {rxData.current.bk.toString()}
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    );
  }
  */

  const steps = [
    {
      label: "TX/RX Number",
      description: displayTxRxCount()
    },
    {
      label: "Select Banking",
      description: (
        <Stack>
          <BankingScheme
            expanded={true}
            onSelect={handleSelectBankingScheme}
            defaultSelect={defaultSelect}
            asic={asic.current}
            bankingListAll={bankingListAll}
            bankingSchemeConfig={bankingSchemeConfig}
          />
        </Stack>
      )
    },
    {
      label: "TX/RX Order",
      description: displayTxRxMapping()
    },
    {
      label: "Physical to Logical Axes",
      description: displayAxisSelect()
    }
  ];

  return (
    <Stack
      direction="column"
      justifyContent="space-between"
      spacing={2}
      sx={{ width: 500 }}
    >
	 { initState && dataReady &&
      <Stepper
        nonLinear
        activeStep={activeStep}
        orientation="vertical"
        sx={{ pl: 2, pt: 2 }}
      >
        {steps.map((step, index) => (
          <Step key={step.label}>
            <Button
              variant="text"
              onClick={() => handleStep(index)}
              style={{ justifyContent: "flex-start" }}
              sx={{ pl: 0, width: 480 }}
            >
              {displayStepIcon(index)}
              <Typography>{step.label}</Typography>
            </Button>
            <StepContent>
              <Box sx={{ m: 1 }}>
                <div>{step.description}</div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
	  }

      {displayAlert()}

      {dataReady && (
        <Button
          id={extensionConst.buttonApplyId}
          sx={{ width: 0, height: 0, p: 0, m: 0, b: 0 }}
          onClick={onApply}
        />
      )}
    </Stack>
  );
}
