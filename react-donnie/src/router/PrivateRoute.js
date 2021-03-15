import React, {useEffect, useState} from 'react'
import {Redirect, Route} from 'react-router-dom'
import {adminState} from "~/hooks/atomState";
import {useRecoilState} from 'recoil'
import authApi from "~/lib/authApi";
import {message} from 'antd'

const ADMIN = 'admin'
export const fakeAuth = {
    clearCookie: function (type) {
        fakeAuth[type].isAuthenticated = false
        localStorage.removeItem(`${type}SessionKey`)
    },
    setCookie: function (res, type) {

        console.log({loginSessionRes: res})

        const {status, data} = res

        if (status === 200) {

            //로그인 여부
            fakeAuth[type].isAuthenticated = true

            //쿠키에 세션키 할당(공통)
            localStorage.setItem(`${type}SessionKey`, data.sessionKey)

            //추가 쿠키할당(optional)
            switch (type) {
                case ADMIN :
                    // do something
                    break;
            }
        }else {
            //로그인 여부
            fakeAuth[type].isAuthenticated = false
        }
    },
    [ADMIN]: {
        loginPathname: '/admin/login',
        isAuthenticated: false,
        authenticate: async ({email, valword},cb) => {
            const res = await authApi.adminLogin({email, valword})

            const userStatus = res.data.status

            if (userStatus === 100){
                message.error('아이디나 비밀번호가 잘못되었습니다')
                return
            }

            if (userStatus === 200) {
                // fakeAuth.setCookie(res, ADMIN)
                setTimeout(cb,  100)   //fake sync
            }
        },
        signout: async (cb) => {
            // fakeAuth.clearCookie(ADMIN)
            await authApi.adminLogout()
            setTimeout(cb,  100)
        },
        autoLogin: async (cb) => {

            let loginInfo = null;

            // 백앤드 세션확인
            const {status, data} = await authApi.getAdmin()

            console.log({status, getAdmin: data})

            if (status === 200) {

                if (data.status === 200) {
                    loginInfo = data
                    fakeAuth[ADMIN].isAuthenticated = true
                    setTimeout(cb, 100)
                }else {
                    fakeAuth[ADMIN].isAuthenticated = false
                    setTimeout(cb, 100)
                }

            }else {
                fakeAuth[ADMIN].isAuthenticated = false
            }

            return loginInfo


            //쿠키가 있을 경우만 자동 로그인 실행
            // if (localStorage.getItem('adminSessionKey')) {
            //     const {status, data} = await authApi.getAdmin()
            //     console.log({status, data})
            //     if (status === 200) {
            //         loginInfo = data
            //         fakeAuth[ADMIN].isAuthenticated = true
            //         setTimeout(cb, 100)
            //     } else {
            //         fakeAuth[ADMIN].isAuthenticated = false
            //         setTimeout(cb, 100)
            //     }
            // }else {
            //     fakeAuth[ADMIN].isAuthenticated = false
            // }
            //
            // return loginInfo
        }
    }
}

export const PrivateRoute = ({ type, children, ...rest }) => {

    const [loading, setLoading] = useState(true)
    const [, setAdmin] = useRecoilState(adminState);

    useEffect(() => {

        async function fetch() {

            //자동 로그인 시도
            const loginInfo = await fakeAuth[type].autoLogin()

            //auto login 후 session 정보를 사용자별로 담기 => 전역 state에 넣습니다
            switch (type) {
                case ADMIN :
                    setAdmin(loginInfo)
            }

            setLoading(false)
        }

        fetch()

    }, [])

    if (loading) return <div></div>

    return(
        <Route
            {...rest}
            render={({ location }) =>
                fakeAuth[type].isAuthenticated ? (
                    children
                ) : (
                    <Redirect
                        to={{
                            pathname: fakeAuth[type].loginPathname,
                            state: { from: location }
                        }}
                    />
                )
            }
        />
    )
}
