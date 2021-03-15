import React, {useState, useEffect} from 'react'
import { Helmet } from 'react-helmet-async';
import {Div} from "~/styledComponents/shared/Layouts"
import {Input, Button} from 'antd'
import {fakeAuth} from "~/router/PrivateRoute";
import {useHistory, useLocation} from 'react-router-dom'
import {message} from 'antd'
// import {Server} from "~/Properties";
// import {BsShieldLock} from 'react-icons/bs'
// import {color} from "../../../styledComponents/Properties";

const AdminLogin = () => {

    const [formData, setFormData] = useState({
        email: '',
        valword: ''
    })

    let history = useHistory();
    let location = useLocation();
    let { from } = location.state || { from: { pathname: "/admin" } };

    const onInputChange = ({target}) => {
        const {name, value} = target
        setFormData({
            ...formData,
            [name]: value
        })
    }
    // 엔터키값으로 로그인
    const onInputKeyPress = (e) => {
        if(e.key == 'Enter'){
            login();
        }
    };

    const login = () => {

        const { email, valword } = formData

        if (!email) {
            message.warn('이메일을 입력해 주세요')
            return
        }
        if (!valword) {
            message.warn('비밀번호를 입력해 주세요')
            return
        }

        fakeAuth.admin.authenticate({
            email: email,
            valword: valword
        }, () => history.replace(from))
    };
    const {email, valword} = formData

    return (
        <Div relative height={'100%'}>
            <Helmet>
                <title>Donnie AdminLogin</title>
            </Helmet>

            <Div absolute center minWidth={400} bgFrom={'white'} bgTo={'light'} textAlign={'center'}>
                <Div bc={'darkLight'} fg={'dark'} p={30} py={70} rounded={4}>
                    <Div mb={20} fontSize={20} bold>
                        Donnie Admin 로그인
                    </Div>
                    <Div mb={10}>
                        <Input name={'email'} placeholder={'이메일을 입력하세요'} size={'large'} onChange={onInputChange} value={email}/>
                    </Div>
                    <Div mb={30}>
                        <Input name={'valword'} type={'password'} placeholder={'비밀번호를 입력하세요'} size={'large'} onChange={onInputChange} onKeyPress={onInputKeyPress} value={valword}/>
                    </Div>
                    <Div mb={20}>
                        <Button type={'primary'} block onClick={login} size={'large'}>로그인</Button>
                    </Div>
                </Div>
            </Div>
        </Div>
    )
}

export default AdminLogin