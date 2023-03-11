// import { store } from '../../index'
// import * as actions from './index';

// export function isOpen() {
//   return store.dispatch(actions.getOpenState());
// }

// export function isVisible() {
//   return store.dispatch(actions.getVisibleState());
// }

// export function initialize() {
//   store.dispatch(actions.initialize());
// }

// export function connect() {
//   store.dispatch(actions.connect());
// }

// export function disconnect() {
//   store.dispatch(actions.disconnect());
// }

// export function addUserMessage(text:string) {
//   store.dispatch(actions.addUserMessage(text));
// }

// export function emitUserMessage(text:string) {
//   store.dispatch(actions.emitUserMessage(text));
// }

// export function addResponseMessage(text:string) {
//   store.dispatch(actions.addResponseMessage(text));
// }

// export function addCarousel(carousel:string) {
//   store.dispatch(actions.addCarousel(carousel));
// }

// export function addVideoSnippet(video:any) {
//   store.dispatch(actions.addVideoSnippet(video));
// }

// export function addImageSnippet(image:string) {
//   store.dispatch(actions.addImageSnippet(image));
// }

// export function addButtons(buttons:string) {
//   store.dispatch(actions.addButtons(buttons));
// }

// export function setButtons(id:any, title:string) {
//   store.dispatch(actions.setButtons(id, title));
// }

// export function insertUserMessage(id:any, text:string) {
//   store.dispatch(actions.insertUserMessage(id, text));
// }

// export function renderCustomComponent(component:string, props:string, showAvatar = false) {
//   store.dispatch(actions.renderCustomComponent(component, props, showAvatar));
// }

// export function openChat() {
//   store.dispatch(actions.openChat());
// }

// export function closeChat() {
//   store.dispatch(actions.closeChat());
// }

// export function toggleChat() {
//   store.dispatch(actions.toggleChat());
// }

// export function showChat() {
//   store.dispatch(actions.showChat());
// }

// export function hideChat() {
//   store.dispatch(actions.hideChat());
// }

// export function toggleFullScreen() {
//   store.dispatch(actions.toggleFullScreen());
// }

// export function toggleInputDisabled(disable:string) {
//   store.dispatch(actions.toggleInputDisabled(disable));
// }

// export function dropMessages() {
//   store.dispatch(actions.dropMessages());
// }

// export function pullSession() {
//   store.dispatch(actions.pullSession());
// }

// export function newUnreadMessage() {
//   store.dispatch(actions.newUnreadMessage());
// }

// export function send(playload:any, text = '', customStore:any) {
//   if (customStore) {
//     customStore.dispatch(actions.emitUserMessage(playload));
//     if (text !== '') customStore.dispatch(actions.addUserMessage(text));
//     return;
//   }
//   store.dispatch(actions.emitUserMessage(playload));
//   if (text !== '') store.dispatch(actions.addUserMessage(text));
// }

export {}
