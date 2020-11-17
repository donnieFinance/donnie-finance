<template>
  <div class="DonnieVault">
    <div class="header">
      <div>
        <img src="../../assets/dony_go.png" alt />
        <span class="headline">Exchange</span>
      </div>
    </div>
    <div class="content flex">
      <p>
        <!-- {{$t('vaultContent')}} -->
        자동유동성 공급으로 거래할 수 있는 플랫폼
      </p>
      <img src="../../assets/coming_soon.png" alt />
    </div>
  </div>
</template>

<script>
export default {
  mounted () {
  },    
}
</script>

<style lang="less" scoped>
@import '@/styles/color.less';
.DonnieVault {
  flex: 1;
  padding-top: 70px;
  background-color: @dark-blue;
  .header {
    display: flex;
    justify-content: center;
    margin-top: 40px;
    div {
      img:nth-child(1) {
        width: 60px;
      }
      // img:nth-child(2) {
      //   width: 270px;
      //   margin-left: 25px;
      // }
      .headline {
          margin-left: 10px;
          font-size: 60px;
          font-weight: 500;
          color: #eee;
      }
    }
  }
  .content {
    margin-top: 20px;
    color: #fff;
    p {
      width: 80%;
      max-width: 550px;
      text-align: center;
      font-weight: 400;
    }
    img {
      width: 80%;
      max-width: 593px;
      margin-top: 55px;
    }
  }
}
@media (max-width: 920px) {
  .DonnieVault {
    .header {
      display: flex;
      justify-content: center;
      margin-top: 30px;
      div {
        margin-left: 20%;
        img:nth-child(1) {
          width: 15%;
        }
        img:nth-child(2) {
          width: 60%;
          margin-left: 5px;
        }
      }
    }
  }
}
</style>
