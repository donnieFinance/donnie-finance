import React, {useEffect, useState} from 'react';
import AdminApi from "~/lib/adminApi";

const ApproveRenderer = (props) => {



    const [data, setData] = useState()

    useEffect(() => {

        console.log({iwTokenName: props.data})

        AdminApi.getIwErcTokenApproved(props.data.iwTokenName, props.data.ircAccount).then((res) => {
            console.log({res})
            setData(res.data)
        })
    }, [])

    if (data === undefined) return '...'

    return (
        <div>{data}</div>
    );
};


export default ApproveRenderer;
