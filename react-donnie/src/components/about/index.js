import React from 'react';
import {withTranslation} from "react-i18next";

import icon_services_01global from '~/assets/about/icon_services_01global.png'
import icon_services_02reliable from '~/assets/about/icon_services_02reliable.png'
import icon_services_03sustainable from '~/assets/about/icon_services_03sustainable.png'
import icon_services_04fast from '~/assets/about/icon_services_04fast.png'

import illust_why_d from '~/assets/about/illust_why_d.png'
import pie_chart_pc from '~/assets/about/pie_chart_pc.png'
import pie_chart_m from '~/assets/about/pie_chart_m.png'
import diagram_history from '~/assets/about/diagram_history.png'
import diagram_history_t from '~/assets/about/diagram_history_t.png'
import diagram_history_m from '~/assets/about/diagram_history_m.png'
import logo_ezfarm from '~/assets/about/ezfarm_logo.png'
import logo_iost2 from '~/assets/about/logo_iost2.png'
import logo_halborn from '~/assets/about/logo_halborn.png'
import logo_slowmist from '~/assets/about/logo_slowmist.png'
import telegram_01 from '~/assets/about/01_telegram.png'
import medium_02 from '~/assets/about/02_medium.png'
import twitter_03 from '~/assets/about/03_twitter.png'
import github_05 from '~/assets/about/05_github.png'
import telegram_c_01 from '~/assets/about/01_telegram_c.png'
import medium_c_02 from '~/assets/about/02_medium_c.png'
import github_c_05 from '~/assets/about/05_github_c.png'
import illust_meaning from '~/assets/about/illust_meaning.png'

import logo_tpay from '~/assets/about/logo_tpay.png'
import logo_cobak from '~/assets/about/logo_cobak.png'
import logo_deficode from '~/assets/about/logo_deficode.png'
import logo_husd from '~/assets/about/logo_husd.svg'

import './index.less'
import {PageHeader} from "antd";
import PageHeading from "~/components/common/layouts/PageHeading";


export default withTranslation()((props) => {

    const {t} = props;
    const {about} = t('menu', {returnObjects: true})

    return (
        <div className="DonnieVault background content">


            <PageHeading
                title={'Donnie Finance'}
                description={about.desc}
            />


            <div id="wrap">
                <div className="d_info about_cont">
                    <div className="inner">
                        <div>
                            <h2>Donnie Finance</h2>
                            <p>The First Decentralized and Integrated Financial
                                Service Provider</p>
                            <p>Community Driven and Open Sourced Platform
                            </p>
                        </div>
                        <div className="d_info_img">
                        </div>
                        <div className="service_iconbox">
                            <h3>All-in-One Financial Services</h3>
                            <ul>
                                <li data-aos="zoom-in" data-aos-duration="1000">
                                    <img src={icon_services_01global} alt="services icon" />
                                    <p>Global</p>
                                </li>
                                <li data-aos="zoom-in" data-aos-duration="1000">
                                    <img src={icon_services_02reliable} alt="reliable icon" />
                                    <p>Reliable</p>
                                </li>
                                <li data-aos="zoom-in" data-aos-duration="1000">
                                    <img src={icon_services_03sustainable}
                                         alt="sustainable icon" />
                                    <p>Sustainable</p>
                                </li>
                                <li data-aos="zoom-in" data-aos-duration="1000">
                                    <img src={icon_services_04fast} alt="fast icon" />
                                    <p>Fast</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                {/* d_info */}
                <div className="d_our_vision about_cont">
                    <div className="inner" data-aos="fade-up" data-aos-duration="1000">
                        <h3 className="w_text">Our Vision</h3>
                        <ul>
                            <li>
                                <p>
                                    Current Market is misleading and inefficient, <strong>but Donnie has potential
                                    to be the next generation of financial services.</strong>
                                </p>
                            </li>
                            <li>
                                <p>
                                    Current Market is too difficult for ordinary people to adopt, <strong>but Donnie
                                    is available for anyone, anywhere with any device with no complicated
                                    process.</strong>
                                </p>
                            </li>
                            <li>
                                <p>
                                    Current Market is owned and governed by the financial service provider not
                                    users, <strong>but Donnie is 100&#37; community driven and open sourced with no
                                    intermediary.</strong>
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>
                {/* d_our_vision */}
                <div className="d_product about_cont">
                    <div className="inner">
                        <h3 data-aos="fade-down" data-aos-duration="1500">Product</h3>
                        <div>
                            <dl>
                                <dt>Checking & Saving</dt>
                                <dd>Deposit and withdraw cryptocurrency anytime, anywhere with no fee</dd>
                                <dd>Deposit and earn yields with any cryptocurrency (“Token of Your Choice”)</dd>
                                <dd>Token of Your Choice : IRC20 Tokens are available when launched, but will be
                                    expanded to all ERC20 and other cryptocurrencies
                                </dd>
                            </dl>
                            <dl>
                                <dt>IOSTarter</dt>
                                <dd>Join a IOSTarter,  built for cross-chain token offerings, which enables new projects to raise liquidity in a decentralized fair protocol.
                                </dd>
                            </dl>
                            <dl>
                                <dt>Exchange</dt>
                                <dd>Provide safe and stable DEX platform for our users</dd>
                                <dd>DON token can lower the transaction and network fee</dd>
                                <dd>Adopting hybrid Automated Market Maker (AMM), we seek to negate slippage</dd>
                                <dd>Impermanent loss is not to be appeared by sustaining stable swap ratio through
                                    simultaneously linking the liquidity pools’ swap ratio with off-chain exchange
                                    ratio
                                </dd>
                            </dl>
                            <dl>
                                <dt>Payment</dt>
                                <dd>Support direct transaction between users through the network</dd>
                                <dd>Lower the payment cost by dissociating of conventional bank and its network, VAN
                                    and PG company
                                </dd>
                            </dl>
                            <dl>
                                <dt>Portfolio Mgmt.</dt>
                                <dd>Aggregator service gives advice on users' cryptocurrency investments and
                                    automatically balances users' digital assets
                                </dd>
                                <dd>Recommends optimized portfolio based on users’ existent portfolio and credit
                                </dd>
                                <dd>Automatically farming yields to achieve highest income</dd>
                                <dd>Insurance product also integrated as one of the investment assets</dd>
                            </dl>
                            <dl>
                                <dt>Credit Analysis</dt>
                                <dd>Evaluate appropriate credit levels by evaluating the creditworthiness of those
                                    participating in the Decentralized Platform
                                </dd>
                                <dd>Collect primary data based on data such as loans, deposits, transactions and
                                    payments within the service
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
                {/* d_product */}
                <div className="d_why_don about_cont">
                    <div className="inner">
                        <h3 data-aos="fade-down" data-aos-duration="1500">Why DON?</h3>
                        <ul data-aos="fade-up" data-aos-duration="1000">
                            <li>Total Issuance : 10,000,000</li>
                            <li>Fully community driven and open sourced</li>
                            <li>Donnie Finance distributes DON to the first-movers and participants as incentive for
                                each of the services
                            </li>
                            <li>Function :
                                <div>
                                    <p>- Propose new agenda on its community and vote</p>
                                    <p>- Able to delegate to others</p>
                                    <p>- Stake and lock to earn vote powers</p>
                                    <p>- Lower the transaction fee and network fee</p>
                                </div>
                            </li>
                        </ul>
                        <div className="y_img" data-aos="fade-up" data-aos-duration="1000">
                            <img src={illust_why_d} alt="Financial illustration" />
                        </div>
                    </div>
                </div>

                <div className="about_cont">
                    <div className="inner">
                        <h3 data-aos="fade-down" data-aos-duration="1500" className="m_hide"
                            // style="padding-bottom: 0; margin-bottom: -50px;"
                            style={{paddingBottom: 0, marginBottom: -50}}
                        >Token Allocation</h3>
                        <h3 data-aos="fade-down" data-aos-duration="1500" className="pc_hide"
                            // style="padding-bottom: 0;"
                            style={{
                                paddingBottom: 0
                            }}
                        >Token Allocation</h3>
                        <img src={pie_chart_pc} alt="donnie pie_chart" className="m_hide"
                            // style="width: 100%"
                             style={{
                                 width: '100%'
                             }}
                        />
                        <img src={pie_chart_m} alt="donnie pie_chart" className="pc_hide"
                            // style="width: 100%"
                             style={{
                                 width: '100%'
                             }}
                        />
                    </div>
                </div>
                {/* d_why_don */}
                <div className="d_roadmap about_cont">
                    <div className="inner">
                        <h3>Roadmap</h3>
                        <img src={diagram_history} alt="donnie history" className="m_hide" />
                        <img src={diagram_history_t} alt="donnie history"
                             className="pc_hide m2_hide" />
                        <img src={diagram_history_m} alt="donnie history"
                             className="pc_hide t_hide" />
                        <div className="partner_box">
                            <h6>Powered by</h6>
                            <span>
                                <img src={logo_iost2} alt="iost logo" className="logo_iost" />
                            </span>
                            {/*<span*/}
                            {/*    // style="padding-left: 80px;"*/}
                            {/*    style={{*/}
                            {/*        paddingLeft: 30*/}
                            {/*    }}*/}
                            {/*>*/}
                            {/*    <img src={logo_ezfarm} alt={"ezfarm logo"} className="logo_ezfarm" />*/}
                            {/*</span>*/}
                            <h6>Audited and Secured by</h6>
                            <div className="m_hide"
                                // style="display: flex; justify-content: center; padding-top: 10px;"
                                 style={{
                                     display: 'flex',
                                     justifyContent: 'center',
                                     paddingTop: 10
                                 }}
                            >
              <span>
                <img src={logo_halborn} alt="halborn logo" className="logo_halborn" />
              </span>
                                <span
                                    // style="padding-left: 80px;"
                                    style={{
                                        paddingLeft: 80
                                    }}
                                >
                <img src={logo_slowmist} alt="halborn logo" className="logo_slowmist" />
              </span>
                            </div>

                            <div className="pc_hide"
                                // style="display: flex; justify-content: center; padding-top: 10px;"
                                 style={{
                                     display: 'flex',
                                     justifyContent: 'center',
                                     paddingTop: 10
                                 }}
                            >
              <span>
                <img src={logo_halborn} alt="halborn logo" className="logo_halborn" />
              </span>
                                <span
                                    // style="padding-left: 30px;"
                                    style={{
                                        paddingLeft: 30
                                    }}
                                >
                <img src={logo_slowmist} alt="halborn logo" className="logo_slowmist" />
              </span>
                            </div>


                            <h3>Partners</h3>
                            <h5>- More To Be Announced -</h5>
                            <ul className="partners_list">
                                <li><img src={logo_tpay} alt="tpay logo" /></li>
                                <li><img src={logo_cobak} alt="cobak logo" /></li>
                                <li><img src={logo_deficode} alt="deficode logo" /></li>
                                <li><img src={logo_husd} style={{maxWidth:170}} alt="husd logo" /></li>
                            </ul>
                        </div>
                    </div>
                </div>
                {/* d_roadmap + partners */}

                <div className="d_contact about_cont">
                    <div className="inner">
                        <h3 data-aos="fade-down" data-aos-duration="1500">Contact Us</h3>
                        <h6 data-aos="zoom-in" data-aos-duration="1000">info&#64;donnie.finance</h6>
                        <ul className="m_hide">
                            <li data-aos="zoom-in" data-aos-duration="1000">
                                <a href="https://t.me/donniefinance" target='_blank' title="telegram">
                                    <img src={telegram_01} alt="telegram shortcut" />
                                </a>
                            </li>
                            <li data-aos="zoom-in" data-aos-duration="1000">
                                <a href="https://donnie-finance.medium.com/" target='_blank' title="medium">
                                    <img src={medium_02} alt="medium shortcut" />
                                </a>
                            </li>
                            <li data-aos="zoom-in" data-aos-duration="1000">
                                <a href="https://twitter.com/DonnieFinance" target='_blank' title="twitter">
                                    <img src={twitter_03} alt="twitter shortcut" />
                                </a>
                            </li>

                            {/*<li data-aos="zoom-in" data-aos-duration="1000">*/}
                            {/*  <a href="#none" title="comming soon">*/}
                            {/*    <img src="@/assets/about/04_discord.png" alt="discord shortcut"></a>*/}
                            {/*</li>*/}
                            <li data-aos="zoom-in" data-aos-duration="1000">
                                <a href="https://github.com/donnieFinance/donnie-finance"
                                   target='_blank' title="github">
                                    <img src={github_05} alt="github shortcut" />
                                </a>
                            </li>
                        </ul>
                        {/* m_hide */}

                        <ul className="pc_hide">
                            <li data-aos="zoom-in" data-aos-duration="1000">
                                <a href="https://t.me/donniefinance" target='_blank' title="telegram">
                                    <img src={telegram_c_01} alt="telegram shortcut" />
                                </a>
                            </li>
                            <li data-aos="zoom-in" data-aos-duration="1000">
                                <a href="https://medium.com/@donnie.finance"
                                   target='_blank' title="medium shortcut">
                                    <img src={medium_c_02} alt="medium shortcut" />
                                </a>
                            </li>

                            {/*<li data-aos="zoom-in" data-aos-duration="1000">*/}
                            {/*    <a href="https://twitter.com/DonnieFinance" target='_blank' title="twitter shortcut">*/}
                            {/*    <img src="@/assets/about/03_twitter_c.png" alt="twitter shortcut" />*/}
                            {/*    </a>*/}
                            {/*</li>*/}
                            {/*<li data-aos="zoom-in" data-aos-duration="1000">*/}
                            {/*    <a href="#none">*/}
                            {/*        <img src="@/assets/about/04_discord_c.png" alt="discord shortcut"></a>*/}
                            {/*</li>*/}


                            <li data-aos="zoom-in" data-aos-duration="1000">
                                <a href="https://github.com/donnieFinance/donnie-finance"
                                   target='_blank' title="github shortcut">
                                    <img src={github_c_05} alt="github shortcut" />
                                </a>
                            </li>
                        </ul>
                        {/* pc_hide */}

                    </div>
                </div>
                {/* d_contact  */}
                {/*<div className="d_meaning_of_d about_cont">*/}
                {/*    <div className="inner">*/}
                {/*        <h2>The meaning of Donnie</h2>*/}
                {/*        <div>*/}
                {/*            <img src={illust_meaning} alt="the meaning of donnie" />*/}
                {/*        </div>*/}
                {/*        <ul>*/}
                {/*            <li>“DON” means “money” in Korean</li>*/}
                {/*            <li>“Donnie” which is a form of English nickname of “DON” is used to engage more users*/}
                {/*                and be acknowledged familiar than other project*/}
                {/*            </li>*/}
                {/*            <li>We focused on the fundamental principle of financial market and seek to implement*/}
                {/*                real meaning of financial services in the De-Fi market. It is the reason why we use*/}
                {/*                “DON” as the project name*/}
                {/*            </li>*/}
                {/*        </ul>*/}
                {/*    </div>*/}
                {/*</div>*/}
                {/* d_meaning_of_d */}

            </div>
        </div>
    )
});