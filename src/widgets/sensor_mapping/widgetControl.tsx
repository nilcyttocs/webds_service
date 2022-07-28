import React, { useEffect, useState, useRef } from "react";

import { Stack, Button } from "@mui/material";

import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

import { extensionConst } from "./constant";

export default function WidgetControl(props: any) {
    const [activeStep, setActiveStep] = useState(0);
    const [disableButton, setDisableButton] = useState(false);
    const stepStatus = useRef<number[]>(Array(extensionConst.steps).fill(0));

    useEffect(() => {
        setActiveStep(props.step);
    }, [props.step]);

    const updateStep = (step: number) => {
        if (step === extensionConst.steps + 1) {
            setActiveStep(0);
            stepStatus.current = Array(extensionConst.steps).fill(0);
            props.updateStep(0);
        } else {
            props.updateStep(step);
            setActiveStep(step);
        }
    };

    const handleNext = () => {
        updateStep(activeStep + 1);
    };

    const handleBack = () => {
        updateStep(activeStep - 1);
    };

    const handleApply = () => {
        let step = activeStep;
        const elem = document.getElementById(extensionConst.buttonApplyId) as HTMLButtonElement;
        elem.value = step.toString();
        elem.click();
    };

    function showStep() {
        return (
            <>
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
            >
                <Button
                    variant="text"
                    size="small"
                    onClick={handleBack}
                    disabled={activeStep === 0}
                >
                    <KeyboardArrowLeft />
          Prev
        </Button>

                <Button
                    onClick={handleApply}
                    sx={{ width: 160 }}
                    disabled={disableButton}
                >
                    {activeStep === extensionConst.steps ? "Done" : "Apply"}
                </Button>

                <Button
                    variant="text"
                    size="small"
                    onClick={handleNext}
                    disabled={activeStep >= extensionConst.steps}
                >
                    Next
          <KeyboardArrowRight />
                </Button>
                </Stack>

                <Button
                    id={extensionConst.buttonControlId}
                    sx={{ width: 0, height: 0, p: 0, m: 0, b: 0 }}
                    onClick={(e) => {
                        if (e.currentTarget.value !== "false" ) setDisableButton(false);
                        else setDisableButton(true);
                    }}
                />
                </>
        );
    }

    return <>{showStep()}</>;
}
