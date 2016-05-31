export default function classes() {
  return `
  .redux-ab-test--debugger {
    z-index: 25000;
    position: fixed;
    transform: translateX(-50%);
    bottom: 0;
    left: 50%;
  }
  .redux-ab-test--debugger ul {
    margin: 0;
    padding: 0 0 0 20px;
  }
  .redux-ab-test--debugger li {
    margin: 0;
    padding: 0;
    font-size: 14px;
    line-height: 14px;
  }
  .redux-ab-test--debugger input {
    float: left;
    margin: 0 10px 0 0;
    padding: 0;
    cursor: pointer;
  }
  .redux-ab-test--debugger label {
    color: #999;
    margin: 0 0 10px 0;
    cursor: pointer;
    font-weight: normal;
    transition: all .25s;
  }
  .redux-ab-test--debugger label.active {
    color: #000;
  }
  .redux-ab-test--debugger .experiment_name {
    font-size: 16px;
    color: #000;
    margin: 0 0 10px 0;
  }
  .redux-ab-test--debugger .production_build_note {
    font-size: 10px;
    color: #999;
    text-align: center;
    margin: 10px -40px 0 -10px;
    border-top: 1px solid #b3b3b3;
    padding: 10px 10px 5px 10px;
  }
  .redux-ab-test--debugger .handle {
    cursor: pointer;
    padding: 5px 10px;
  }
  .redux-ab-test--debugger .panel {
    padding: 15px 40px 5px 10px;
  }
  .redux-ab-test--debugger .container {
    font-size: 11px;
    background-color: #ebebeb;
    color: #000;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    border-top: 1px solid #b3b3b3;
    border-left: 1px solid #b3b3b3;
    border-right: 1px solid #b3b3b3;
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
  }
  .redux-ab-test--debugger .close {
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    color: #c00;
    position: absolute;
    top: 0;
    right: 7px;
    transition: all .25s;
  }
  .redux-ab-test--debugger .close:hover {
    color: #f00;
  }
  `;
}
