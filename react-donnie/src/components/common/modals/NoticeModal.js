import React from 'react';
import {useTranslation} from "react-i18next";
import {useRecoilState} from "recoil";
import {myDonModalState} from "~/hooks/atomState";
import {Modal} from "antd";
import {Div, Hr, Span, Flex} from "~/styledComponents/shared";
import {noticeModalState} from "~/hooks/atomState";
import {AiOutlineAlert} from 'react-icons/ai'

const ModalContent = () => {
    const {t} = useTranslation()
    return(
        <Div lineHeight={25}>
            <Div fontSize={25} mb={10} fw={700}>BEWARE OF SCAM ATTEMPTS!</Div>
            <Div>THE CONTRACT ADDRESS IS</Div>
            <a target={'_blank'} href={'https://www.iostabc.com/contract/Contract5ndTHiqRRPWnT5wBFhQ9bthhueT9LVFnuGgGEVfmVRb8'}>Contract5ndTHiqRRPWnT5wBFhQ9bthhueT9LVFnuGgGEVfmVRb8</a>
            <Hr my={20}/>
            <Div fontSize={25} mb={10} fw={700}>사칭주의!</Div>
            <Div>DON 컨트랙트 주소</Div>
            <a target={'_blank'} href={'https://www.iostabc.com/contract/Contract5ndTHiqRRPWnT5wBFhQ9bthhueT9LVFnuGgGEVfmVRb8'}>Contract5ndTHiqRRPWnT5wBFhQ9bthhueT9LVFnuGgGEVfmVRb8</a>
        </Div>
    )
}

const NoticeModal = (props) => {
    const {t} = useTranslation()
    const [noticeOpen, setNoticeOpen] = useRecoilState(noticeModalState)

    return (
        <>
            <Modal
                title={
                    <Flex>
                        <Flex mr={10}><AiOutlineAlert size={20}/></Flex>
                        <Div>{t('warning')}</Div>
                    </Flex>
                }
                visible={noticeOpen}
                onCancel={() => setNoticeOpen(false)}
                footer={null}
                width={'auto'} //UserLogin.js 의 width 값과 같이 맞춰야 합니다
                centered={true}
                focusTriggerAfterClose={false}
                getContainer={false}
                maskClosable={false}
                destroyOnClose={true}
            >
                <ModalContent />
            </Modal>

        </>
    );
};

export default NoticeModal;
