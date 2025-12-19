import { useOutletContext } from "react-router"

import toast from "~/universal/toast"
import { InputButton } from "~/utils/components/Inputs"
import { classes } from "~/utils/jsx-helper"

import { SettingsLayoutContext } from "./_layout"

import layoutCss from "./_layout.module.styl"

export default function ClientSettingsPage () {
	
	const layoutContext = useOutletContext<SettingsLayoutContext>()
	const popups = layoutContext.popups
	
	// const PopupNotification = usePopupNotification(layoutContext)
	
	function openCheckbox () {
		// PopupNotification.openPopup({
		// 	title: "Checkbox",
		// 	children: "This is a checkbox!",
		// })
		popups.open({
			title: "Checkbox",
			children: "This is a checkbox!",
		})
	}
	
	async function openCheckbox2 () {
		
		await layoutContext.popups.open({
			title: "Another Checkbox",
			children: "This is another checkbox! should be different from the first one!",
		})
		
		await layoutContext.popups.open({
			children: "This is another another checkbox! This should appears after the previous one is closed!",
		})
		
	}
	
	function generateRandomSentence(): string {
		const sentences = [
			"HI!",
			"河流在倒流。",
			"蓝色的猫在跳舞。",
			"我在梦里遇到了一个会说话的石头。",
			"在一个古老的图书馆里，每本书都有自己的生命，它们会在夜晚悄悄地讲述自己的故事。",
		];
		const randomIndex = Math.floor(Math.random() * sentences.length);
		return sentences[randomIndex];
	}
	
	async function openToast () {
		toast.pop({
			type: toast.types.NOTICE,
			buttons: [
				{
					icon: "check",
					onClick: () => {
						alert("Hi!")
					},
					closeToast: "none"
				},
				{
					icon: "close"
				}
			],
			checkButton: "forest",
			timeout: false
		})(
			<>
				在使用 NFSv4 時，<code>fsid=root</code> 或 <code>fsid=0</code> 選項指定了導出目錄「根」的位置；如果使用這些選項指定了導出目錄，那其它文件夾都必須位於該文件夾下。<code>/etc/nfs.conf</code> 文件中的 <code>rootdir</code> 選項在這種情況下不起效。如果沒有指定 <code>fsid=0</code>，那默認行為與 NFSv3 一致。
				<ul>
					<li>河流在倒流。</li>
					<li>蓝色的猫在跳舞。</li>
					<li>我在梦里遇到了一个会说话的石头。</li>
					<li>在一个古老的图书馆里，每本书都有自己的生命，它们会在夜晚悄悄地讲述自己的故事。</li>
				</ul>
			</>
		);
		toast.pop({type: toast.types.NOTICE})(
			generateRandomSentence()
		);
	}
	
	async function openPromiseToast () {
		
		const prom = new Promise((resolve, reject) => { setTimeout(() => {
			Math.random() > 0.5 ? resolve(1) : reject()
		}, 3000); });
		toast.promise()(prom, {
			pending: { text: <>Pending a 3 seconds timeout...</> },
			success: { text: <>Checked!</> },
			error: { text: <>Failed!</> },
		})
		
	}
	
	return <>
		<div className={classes(layoutCss.innerPage)}>
			
			{/* {PopupNotification.element} */}
			
			<h1>Client Settings</h1>
			
			<p>Not implemented...</p>
			
			<InputButton onClick={openCheckbox}>Open checkbox!</InputButton>
			<InputButton onClick={openCheckbox2}>Open another checkbox!</InputButton>
			<InputButton onClick={openToast}>Open rich toast!</InputButton>
			<InputButton onClick={openPromiseToast}>Open a promise toast!</InputButton>
			
		</div>
	</>
	
}
