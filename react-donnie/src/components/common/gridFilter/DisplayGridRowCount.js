import React, {useState} from "react";
import useInterval from "~/hooks/useInterval";
import {Div, Span} from "~/styledComponents/shared";
import ComUtil from "~/util/ComUtil";

const DisplayGridRowCount = ({gridApi}) => {
    const [displayedRowCount, setDisplayedRowCount] = useState(null)
    const [originRowCount, setOriginRowCount] = useState(null)

    useInterval(() => {
        const count = gridApi.getDisplayedRowCount()
        const count2 = gridApi.getModel().gridOptionsWrapper.gridOptions.rowData.length
        if (displayedRowCount !== count) {
            setDisplayedRowCount(count)
        }
        if (originRowCount !== count2) {
            setOriginRowCount(count2)
        }
    }, 1000)

    if (displayedRowCount === null || originRowCount === null) return '...'
    return(
        <Div fontSize={14} minWidth={64+49.5}>
            <Span>
                {
                    `전체 ${ComUtil.addCommas(originRowCount)}건 / `
                }
            </Span>
            <Span fg={'green'}>
                {
                    `현재 ${ComUtil.addCommas(displayedRowCount)}건`
                }
            </Span>
        </Div>
    )
}
export default DisplayGridRowCount