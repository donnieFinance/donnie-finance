import React, {useState, useEffect} from 'react'
import AdminRoutes from '~/router/AdminRoutes'
import {Div, Flex, Link} from '~/styledComponents/shared'
import {useHistory, Redirect} from 'react-router-dom'
import {AiFillHome} from 'react-icons/ai'
import {BsFillGridFill, BsFillPersonFill} from 'react-icons/bs'
import {BiCoinStack} from 'react-icons/bi'
import { Layout, Menu, Button, Space } from 'antd'
import styled from 'styled-components'
import {color} from '~/styledComponents/Properties'

import {fakeAuth} from "~/router/PrivateRoute";
import {adminState} from "~/hooks/atomState";
import {useRecoilState} from 'recoil'

// import AdminToProviderLinkButton from '~/components/common/buttons/AdminToProviderLoginButton'

const store = [
    // {
    //     key: 'submenu1',
    //     icon: <AiFillHome/>,
    //     name: '비디오관리',
    //     children: [
    //         {to: '/admin', name:'Home'}
    //     ]
    // },
    // {
    //     key: 'submenu2',
    //     icon: <BsFillGridFill/>,
    //     name: '메뉴관리',
    //     children: [
    //         {to: '/admin/menu01', name:'menu01'},
    //         {to: '/admin/menu02', name:'menu02'},
    //         {to: '/admin/menu03', name:'menu03'},
    //     ]
    // },
    {
        key: 'submenu3',
        icon: <BsFillPersonFill/>,
        name: '정보관리',
        children: [
            {to: '/admin/home', name:'대시보드'},
            {to: '/admin/exchange', name:'Exchange'},
            {to: '/admin/properties', name:'Properties'},
            {to: '/admin/ercDonDepositSwap', name:'DON토큰입금'},
            // {to: '/admin/ercDonWithdrawSwap', name:'DON토큰출금'}, //사용하지 않음
            // {to: '/admin/iwlinkDepositSwap', name:'iwlink토큰입금'},
            // {to: '/admin/iwlinkWithdrawSwap', name:'iwlink토큰출금'},
            // {to: '/admin/notice', name:'menu 3'},
            // {to: '/admin/faq', name:'menu 4'},
        ]
    },
    {
        key: 'submenu_iwBLY',
        icon: <BiCoinStack/>,
        name: 'iwBLY 토큰 관리',
        children: [
            {to: '/admin/iwblyDepositSwap', name:'iwBLY토큰입금'},
            {to: '/admin/iwblyWithdrawSwap', name:'iwBLY토큰출금'}
        ]
    },
    {
        key: 'submenu_iwBTC',
        icon: <BiCoinStack/>,
        name: 'iwBTC 토큰 관리',
        children: [
            {to: '/admin/iwbtcDepositSwap', name:'iwBTC토큰입금'},
            {to: '/admin/iwbtcWithdrawSwap', name:'iwBTC토큰출금'}
        ]
    },
    {
        key: 'submenu_BNB',
        icon: <BiCoinStack/>,
        name: 'BNB 토큰 관리',
        children: [
            {to: '/admin/bnbDepositSwap', name:'BNB토큰입금'},
            {to: '/admin/bnbWithdrawSwap', name:'BNB토큰출금'}
        ]
    },
    // {
    //     key: 'submenu_iwETH',
    //     icon: <BiCoinStack/>,
    //     name: 'iwETH 토큰 관리',
    //     children: [
    //         {to: '/admin/iwethDepositSwap', name:'iwETH토큰입금'},
    //         {to: '/admin/iwethWithdrawSwap', name:'iwETH토큰출금'}
    //     ]
    // },
]


const { SubMenu } = Menu;
const { Content, Sider } = Layout;

const Header = styled(Div)`
    padding: 0 16px;
    height: 65px;
    background-color: ${color.dark};
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const SLayout = styled(Layout)`
    padding: 16px 16px 16px;
    background: #fff; 
`;

const SSider = styled(Sider)`
    background: #fff;
`;

const SContent = styled(Content)`
    // padding: 0 24px;
    minHeight: 280px;
`;

const AdminTemplate = (props) => {

    const [admin, setAdmin] = useRecoilState(adminState)
    const history = useHistory()
    const {pathname} = history.location    //라우터 변경시 받는 pathname

    const [to, setTo] = useState(pathname)      //initial value
    //const [openKeys, setOpenKeys] = useState([store[0].key, store[1].key, store[2].key])
    const [openKeys, setOpenKeys] = useState([store[0].key, store[1].key, store[2].key, store[3].key])

    useEffect(() => {
        //pathname에 해당하는 메뉴 펼치기
        const item = getItem(pathname);
        if (openKeys.indexOf(item.key) === -1) {
            setOpenKeys([...openKeys, item.key])
        }

        //아이템에 pathname이 선택되도록 함
        setTo(pathname)


    }, [pathname])

    const getItem = (pathname) => store.find(({children}) => children.find(item => item.to === pathname)) || []

    //로그아웃
    async function onLogoutClick(){

        console.log(JSON.stringify(admin))

        // 1. 전역 state clear
        setAdmin(null)

        // 2. browser 쿠키클리어 및 페이지 이동
        fakeAuth.admin.signout(() => {
            history.push('/admin')
        })
    }

    //로그아웃 exception 때문에 강제로 redirect 하도록 함
    if (!admin)
        return <Redirect to={'/admin/login'} />

    return(
        <Layout>
            <Header>
                {/*<Button onClick={()=>history.push('/logistic/home')}>push</Button>*/}

                <Div display={'inline-block'} fg={'white'} fontSize={20}>관리자</Div>
                <Div>
                    <Flex alignItems={'flex-end'}>
                        <Div mr={15}>
                            <Div bold fg={'white'} fontSize={20}>
                                {admin.nickName}
                            </Div>
                            <Div fg={'white'} fontSize={12}>
                                {admin.email}
                            </Div>
                        </Div>
                        <Space>
                            {/*<AdminToProviderLinkButton/>*/}
                            <Button onClick={onLogoutClick}>로그아웃</Button>
                        </Space>
                    </Flex>
                </Div>

            </Header>
            <Layout>
                <SSider width={200}>
                    <Menu
                        theme={'light'}
                        mode="inline"
                        defaultOpenKeys={openKeys}  //메뉴펼치기
                        // defaultSelectedKeys={[to]} //parent 및 menu 선택
                        onClick={({key}) => {
                            setTo(key)
                        }}
                        selectedKeys={[to]}

                        openKeys={openKeys}
                        onOpenChange={(keys)=>{
                            //console.log(keys)
                            setOpenKeys(keys)
                        }}

                        style={{ height: '100%', borderRight: 0, fontSize:'medium' }}
                    >
                        {
                            store.map(({key, icon, name, children}, index) => (
                                <SubMenu key={key} icon={icon} title={' ' + name}>
                                    {
                                        children.map(({to, name}) => <Menu.Item key={to} style={{fontSize:'medium'}}><Link to={to}>{name}</Link></Menu.Item>)
                                    }
                                </SubMenu>
                            ))

                        }
                    </Menu>
                </SSider>
                <SLayout>
                    <SContent>
                        <AdminRoutes />
                    </SContent>
                </SLayout>
            </Layout>
        </Layout>
    )
}
export default AdminTemplate








