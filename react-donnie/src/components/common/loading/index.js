import React, {useState, useEffect} from 'react';

import {Mask, Div, Flex} from "~/styledComponents/shared";
import styled, {css} from "styled-components";
import {Spin} from "antd";
import {useRecoilState} from "recoil";
import {loadingState} from "~/hooks/atomState";
const Center = styled.div`
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
`;

const ConfirmationContent = () =>
    <Div textAlign={'center'}>
        <Flex bold fontSize={30}>
            <Spin/>
            <Div ml={10}>Confirmation...</Div>
        </Flex>
        <Div fontSize={15}>
            Waiting for your permission.
        </Div>
    </Div>


const PendingContent = () =>
    <Div textAlign={'center'}>
        <Flex bold fontSize={30}>
            <Spin/>
            <Div ml={10}>Pending...</Div>
        </Flex>
        <Div fontSize={15}>
            Please wait for a minutes.
        </Div>
    </Div>

const FailedContent = () =>
    <Div fontSize={30}>
        Failed
    </Div>
const SuccessContent = () =>
    <Div fontSize={30}>
        Success!
    </Div>


//status : 'start', 'end'
const Loading = (props) => {

    const [status] = useRecoilState(loadingState)
    const [content, setContent] = useState()
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        console.log({status})

        if (status === 'confirmation') {
            setContent(ConfirmationContent)
            setVisible(true)
        }
        else if (status === 'pending') {
            setContent(PendingContent)
            setVisible(true)
        }
        else if (status === 'failed') {
            setContent(FailedContent)
            close()
        }
        else if (status === 'success') {
            setContent(SuccessContent)
            close()
        }
    }, [status])

    const close = () => {
        setTimeout(() => {
            setContent(null)
            setVisible(false)
        }, 1000)
    }
    if(!visible) return null

    return (
        <Mask>
            <Center>
                <Flex justifyContent={'center'} p={20}
                      bg={'rgba(0,0,0,0.5)'}
                        bc={'light'}
                      rounded={10}
                      fg={'white'} minWidth={220} minHeight={110} >
                    {content}
                </Flex>
            </Center>
        </Mask>
    );
};

export default Loading;
