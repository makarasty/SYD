const colors = require('colors'),
	fs = require("fs"),
	rl = require('readline').createInterface({ input: process.stdin, output: process.stdout }),
	Discord = require('./data/discord.js'),
	client = new Discord.Client()
ClientProgramRestart = ""
function input(qu) {
	return new Promise((resolve) => {
		rl.question(qu, (an) => {
			resolve(an)
		})
	})
}

function logo(e, t) {
	if (e == "e") {
		NewDateTime = new Date(Date.now())
		var LogoError = `Виникла помилка! (${NewDateTime.getHours()}:${NewDateTime.getMinutes()}:${NewDateTime.getSeconds()})`
	} else {
		var LogoError = ""
	}
	if (t == undefined) {
		t = ''
	}
	console.clear()
	console.log(`█▀▄ ▀ ▄▀▀ ▄▀ ▄▀▄ █▀▀▄ █▀▄\n█░█ █ ░▀▄ █░ █░█ █▐█▀ █░█\n▀▀░ ▀ ▀▀░ ░▀ ░▀░ ▀░▀▀ ▀▀░\n`.blue + `  ▄▀▀ ▀█▀ ▄▀▄ ▀█▀ █░█ ▄▀▀\n  ░▀▄ ░█░ █▀█ ░█░ █░█ ░▀▄\n  ▀▀░ ░▀░ ▀░▀ ░▀░ ░▀░ ▀▀░\n`.yellow + `        BY MaKarastY#6177\n`.grey + LogoError.red + t.yellow)
}
var help = DataRead("help")
function GoHelp(t) {
	if (help) {
		switch (parseInt(t)) {
			case 1:
				console.log("9 ".gray + ">".brightCyan + " вихід в головне меню".gray)
				console.log("CTRL".brightCyan + "+".gray + "C".brightCyan + " аналог ALT+F4\n".gray)
				break
			case 2:
				console.log("Максимально ".gray + "128".brightCyan + " символів".gray)
				console.log(`\\n`.brightCyan + " Змінити рядок".gray)
				console.log(";".brightCyan + " Додати декілька статусів в 1 поле (анімувати)".gray)
				GoHelp(1)
				break
			case 2.1:
				console.log("Максимально ".gray + "128".brightCyan + " символів".gray)
				console.log(`\\n`.brightCyan + " Змінити рядок".gray)
				console.log(";".brightCyan + " Додати декілька статусів в 1 поле (анімувати)".gray)
				console.log("Початкову версію цих даних можна знайти в ".gray + "./data/text".brightCyan)
				GoHelp(1)
				break
		}
	}
}
function DataRead(c) {
	return fs.readFileSync("./data/" + c, "utf8")
}

function DataWrite(c, t) {
	return fs.writeFileSync("./data/" + c, t)
}
async function NewUser() {
	logo()
	console.log("Привіт новий юзер!")
	console.log("Скопіюй свій токен та встав сюди!")
	console.log("ПКМ для вставки якщо ти с пк...")
	PreToken = await input('')
	if (PreToken == undefined || PreToken == "" || PreToken < 2) {
		NewUser()
	} else {
		DataWrite("token", PreToken)
		DataWrite("new", "0")
		GoCode()
	}
}
if (DataRead("new") == "0") {
	GoCode()
}
function GoCode() {
	if (DataRead("new") == "1") {
		NewUser()
	} else {

		async function ClientUpdateExit(ClientStart) {
			switch (ClientStart) {
				case "Start":
					if (DataRead("bufer") == "true") {
						DataWrite("bufer", "false")
						return "no"
					}
					break
				case "Stop":
					DataWrite("bufer", "true")
					process.exit()
			}
		}
		async function waittostatus() {
			console.log("Статус буде увімкнено через 10 сек!".yellow)
			console.log("Для відміни натисніть ENTER.".yellow)

			autostatus = setTimeout(() => {
				ClientLoginNOErr(); clearTimeout(autostatus)
			}, 9000)

			FirstInput = await input('')
			clearTimeout(ClientProgramRestart)
			clearTimeout(autostatus)
			Menu("", "Статус скасовано!".red, "1")
		}
		function MenuExit(e) {
			if (e != '') {
				Menu(e)
			} else {
				Menu("", "Ти в головному меню :D")
			}
		}

		help = DataRead("help")

		Menu()
		//  
		async function Menu(e, t, a) {

			logo(e, t)
			GoHelp(1)

			console.log("1".grey + " > ".brightCyan + "Тип".brightMagenta)
			console.log("2".grey + " > ".brightCyan + "Текст".brightMagenta)
			console.log("3".grey + " > ".brightCyan + "Токен".brightMagenta)
			console.log("4".grey + " > ".brightCyan + "Інше".brightMagenta)
			console.log("5".grey + " > ".brightCyan + "Увімкнути".brightMagenta)
			console.log("6".grey + " > ".brightCyan + "Перезапуск".brightMagenta)
			console.log("")
			if (a != "1") {
				if (DataRead("autostart") == "true") {
					if (DataRead("bufer") == "false") {
						waittostatus()//ждать 10 сек и + статус
					}
				} else {

					MenuGo(await input(''))

				}
			} else {

				MenuGo(await input(''))

			}
		}

		async function MenuGo(data, e) {
			switch (parseInt(data)) {
				// 1111111111111111111111111111111111
				case 1:
					TypeData = DataRead("type")
					logo(e)
					GoHelp(1)
					console.log("1".grey + " > ".brightCyan + "WATCHING".brightMagenta + " Смотрит".grey)
					console.log("2".grey + " > ".brightCyan + "LISTENING".brightMagenta + " Слушает".grey)
					console.log("3".grey + " > ".brightCyan + "STREAMING".brightMagenta + " Стримит".grey)
					console.log("4".grey + " > ".brightCyan + "PLAYING".brightMagenta + " Играет".grey)
					console.log("")
					console.log("Зараз".grey + ": ".brightCyan + TypeData.brightMagenta)
					console.log("")
					TypeInput = await input('')

					console.log(1)
					RealType = "no"
					switch (parseInt(TypeInput)) {
						case 1:
							RealType = "WATCHING"
							break
						case 2:
							RealType = "LISTENING"
							break
						case 3:
							RealType = "STREAMING"
							break
						case 4:
							RealType = "PLAYING"
							break
						default:
							MenuExit()
							break
					}
					if (RealType != "no") {
						DataWrite("type", RealType)
						Menu("", `Тип статус було змінено на ${RealType}`)
					}
					break;
				// 222222222222222222222222222222222222222
				case 2:
					TextsGo(e)
					async function TextsGo(e) {
						Text1Name = DataRead("text1").split(';')
						Text2Sub = DataRead("text2").split(';')
						Text3End = DataRead("text3").split(';')
						logo(e)
						GoHelp(2.1)
						console.log("1".grey + " > ".brightCyan + "Змінити значіння НАЗВА, зараз ↓".brightMagenta)
						for (let i = 0; i < Text1Name.length; i++) {
							if (i != Text1Name.length - 1) {
								console.log("|".grey + " " + parseInt(i + 1) + " " + Text1Name[i].green + ";")
							} else {
								console.log("|".grey + " " + parseInt(i + 1) + " " + Text1Name[i].green)
							}
						}
						console.log("2".grey + " > ".brightCyan + "Змінити значіння ТЕКСТ, зараз ↓".brightMagenta)
						for (let i = 0; i < Text2Sub.length; i++) {
							if (i != Text2Sub.length - 1) {
								console.log("|".grey + " " + parseInt(i + 1) + " " + Text2Sub[i].green + ";")
							} else {
								console.log("|".grey + " " + parseInt(i + 1) + " " + Text2Sub[i].green)
							}
						}
						console.log("3".grey + " > ".brightCyan + "Змінити значіння Гра/Опис, зараз ↓".brightMagenta)
						for (let i = 0; i < Text3End.length; i++) {
							if (i != Text3End.length - 1) {
								console.log("|".grey + " " + parseInt(i + 1) + " " + Text3End[i].green + ";")
							} else {
								console.log("|".grey + " " + parseInt(i + 1) + " " + Text3End[i].green)
							}
						}
						console.log("")

						TextInput = await input('')

						// 111111111111 Text1Name
						switch (parseInt(TextInput)) {
							case 1:
								ChangeName(e)
								async function ChangeName(e) {
									logo(e)
									GoHelp(2.1)
									console.log(">".brightCyan + " - ".grey + "Змінити значіння НАЗВА, зараз ↓".brightMagenta)
									for (let i = 0; i < Text1Name.length; i++) {
										if (i != Text1Name.length - 1) {
											console.log("|".grey + " " + parseInt(i + 1) + " " + Text1Name[i].green + ";")
										} else {
											console.log("|".grey + " " + parseInt(i + 1) + " " + Text1Name[i].green)
										}
									}
									console.log("Введи текст на який ти хочеш змінити:".brightMagenta)
									// запись test1;test2;test3;test4;test5

									Text1NameInput = await input('')

									if (Text1NameInput == "9" || Text1NameInput.length < 1) {
										MenuExit()
										return
									}
									Text1NameInputSplit = Text1NameInput.split(';')
									ChangeNameTo(e)
									async function ChangeNameTo(e) {
										logo(e)
										GoHelp(2.1)
										console.log(">".brightCyan + " - ".grey + "Зміни ↓".brightMagenta)
										var MoreThen128 = ''
										for (let i = 0; i < Text1NameInputSplit.length; i++) {
											if (i != Text1NameInputSplit.length - 1) {
												if (Text1NameInputSplit[i].length > 128) {
													var MoreThen128 = " Занадто багато символів!"
												}
												console.log("|".grey + " " + parseInt(i + 1) + " " + Text1NameInputSplit[i].green + ";" + MoreThen128.red)
											} else {
												if (Text1NameInputSplit[i].length > 128) {
													var MoreThen128 = " Занадто багато символів!"
												}
												console.log("|".grey + " " + parseInt(i + 1) + " " + Text1NameInputSplit[i].green + MoreThen128.red)
											}
										}
										console.log("")
										console.log("1".grey + " > ".brightCyan + "Відміна".brightMagenta)
										console.log("2".grey + " > ".brightCyan + "Зберегти".brightMagenta)

										Text1NameInputSavaChange = await input('')

										if (Text1NameInputSavaChange == "1") {
											ChangeName()
											return
										} else if (Text1NameInputSavaChange == "2") {
											if (MoreThen128 == '') {
												DataWrite("text1", Text1NameInput)
												Menu("", `ТЕКСТ був змінена на ${Text1NameInput}`)
											} else {
												console.log("Неможливо зберегти текст! Занадто довгий")
											}
										} else if (Text1NameInputSavaChange == "9" || Text1NameInput.length < 1) {
											MenuExit()
											return
										} else {
											ChangeNameTo()
											return
										}
									}
								}
								break
							// 2222222222222 Text2Sub 
							case 2:
								ChangeSub(e)
								async function ChangeSub(e) {
									logo(e)
									GoHelp(2.1)
									console.log(">".brightCyan + " - ".grey + "Змінити значіння ТЕКСТ, зараз ↓".brightMagenta)
									for (let i = 0; i < Text2Sub.length; i++) {
										if (i != Text2Sub.length - 1) {
											console.log("|".grey + " " + parseInt(i + 1) + " " + Text2Sub[i].green + ";")
										} else {
											console.log("|".grey + " " + parseInt(i + 1) + " " + Text2Sub[i].green)
										}
									}
									console.log("Введи текст на який ти хочеш змінити:".brightMagenta)
									// запись test1;test2;test3;test4;test5

									Text2SubInput = await input('')

									if (Text2SubInput == "9" || Text1NameInput.length < 1) {
										MenuExit()
										return
									}
									Text2SubInputSplit = Text2SubInput.split(';')
									ChangeSubTo(e)
									async function ChangeSubTo(e) {
										logo(e)
										GoHelp(2.1)
										console.log(">".brightCyan + " - ".grey + "Зміни ↓".brightMagenta)
										var MoreThen128 = ''
										for (let i = 0; i < Text2SubInputSplit.length; i++) {
											if (i != Text2SubInputSplit.length - 1) {
												if (Text2SubInputSplit[i].length > 128) {
													var MoreThen128 = " Занадто багато символів!"
												}
												console.log("|".grey + " " + parseInt(i + 1) + " " + Text2SubInputSplit[i].green + ";" + MoreThen128.red)
											} else {
												if (Text2SubInputSplit[i].length > 128) {
													var MoreThen128 = " Занадто багато символів!"
												}
												console.log("|".grey + " " + parseInt(i + 1) + " " + Text2SubInputSplit[i].green + MoreThen128.red)
											}
										}
										console.log("")
										console.log("1".grey + " > ".brightCyan + "Відміна".brightMagenta)
										console.log("2".grey + " > ".brightCyan + "Зберегти".brightMagenta)

										Text2SubInputSavaChange = await input('')

										if (Text2SubInputSavaChange == "1") {
											ChangeSub()
										} else if (Text2SubInputSavaChange == "2") {
											if (MoreThen128 == '') {
												DataWrite("text2", Text2SubInput)
												Menu("", `НАЗВА була змінена на ${Text2SubInput}`)
											} else {
												console.log("Неможливо зберегти текст! Занадто довгий")
											}
										} else if (Text2SubInputSavaChange == "9" || Text1NameInput.length < 1) {
											MenuExit()
											return
										} else {
											ChangeSubTo()
											return
										}
									}
								}
								break
							// 33333333333333 Text3End
							case 3:
								ChangeEnd(e)
								async function ChangeEnd(e) {
									logo(e)
									GoHelp(2.1)
									console.log(">".brightCyan + " - ".grey + "Змінити значіння ОПИС, зараз ↓".brightMagenta)
									for (let i = 0; i < Text3End.length; i++) {
										if (i != Text3End.length - 1) {
											console.log("|".grey + " " + parseInt(i + 1) + " " + Text3End[i].green + ";")
										} else {
											console.log("|".grey + " " + parseInt(i + 1) + " " + Text3End[i].green)
										}
									}
									console.log("Введи текст на який ти хочеш змінити:".brightMagenta)
									// запись test1;test2;test3;test4;test5

									Text3EndInput = await input('')

									if (Text3EndInput == "9" || Text1NameInput.length < 1) {
										MenuExit()
										return
									}
									Text3EndInputSplit = Text3EndInput.split(';')
									ChangeEndTo(e)
									async function ChangeEndTo(e) {
										logo(e)
										GoHelp(2.1)
										console.log(">".brightCyan + " - ".grey + "Зміни ↓".brightMagenta)
										var MoreThen128 = ''
										for (let i = 0; i < Text3EndInputSplit.length; i++) {
											if (i != Text3EndInputSplit.length - 1) {
												if (Text3EndInputSplit[i].length > 128) {
													var MoreThen128 = " Занадто багато символів!"
												}
												console.log("|".grey + " " + parseInt(i + 1) + " " + Text3EndInputSplit[i].green + ";" + MoreThen128.red)
											} else {
												if (Text3EndInputSplit[i].length > 128) {
													var MoreThen128 = " Занадто багато символів!"
												}
												console.log("|".grey + " " + parseInt(i + 1) + " " + Text3EndInputSplit[i].green + MoreThen128.red)
											}
										}
										console.log("")
										console.log("1".grey + " > ".brightCyan + "Відміна".brightMagenta)
										console.log("2".grey + " > ".brightCyan + "Зберегти".brightMagenta)

										Text3EndInputSavaChange = await input('')

										if (Text3EndInputSavaChange == "1") {
											ChangeEnd()
										} else if (Text3EndInputSavaChange == "2") {
											if (MoreThen128 == '') {
												DataWrite("text3", Text3EndInput)
												Menu("", `НАЗВА була змінена на ${Text3EndInput}`)
											} else {
												console.log("Неможливо зберегти текст! Занадто довгий")
											}
										} else if (Text3EndInputSavaChange == "9" || Text1NameInput.length < 1) {
											MenuExit()
											return
										} else {
											ChangeEndTo()
										}
									}
								}
								break
							default:
								MenuExit()
								break
						}
					}
					break
				case 3:
					GoToken()
					async function GoToken(e, t) {
						logo(e, t)
						GoHelp(1)
						console.log("1".grey + " > ".brightCyan + "Змінити токен".brightMagenta)
						console.log("2".grey + " > ".brightCyan + "Видалити токен".brightMagenta)
						console.log("3".grey + " > ".brightCyan + "Перевірка токену".brightMagenta)
						console.log("")

						TokenInput = await input('')

						switch (parseInt(TokenInput)) {
							case 1:
								logo(e)
								GoHelp(1)
								console.log(">".brightCyan + " - ".grey + "Введи новий токен ".brightMagenta + "(Вставить ПКМ або Ctrl+V)".grey)

								TokenWha = await input('')

								if (TokenWha == "9") {
									MenuExit()
									return
								} else {
									DataWrite("token", TokenWha)
									GoToken("", "Токен змінено!")
								}
								break
							case 2:
								logo(e)
								GoHelp(1)
								console.log(">".brightCyan + " - ".grey + "Ви реально хочте видалити токен?".brightMagenta)
								console.log("| ".grey + "1".brightCyan + " - ".grey + "Так".green)
								console.log("| ".grey + "2".brightCyan + " - ".grey + "Ні".red)

								TokenDel = await input('')

								if (TokenDel == "9") {
									MenuExit()
									return
								} else if (TokenDel == "1" || TokenDel == "Да" || TokenDel == "Da" || TokenDel == "Так") {
									DataWrite("token", "")
									GoToken("", "Токен Видалено!")
								} else {
									GoToken()
								}
								break
							case 3:
								console.log("Перевірка токену почнеться через 2 Сек!".yellow)
								setTimeout(() => {
									CheckToken()
									console.log("Перевірка токену розпочалася, якщо це займе багато часу токен працює!".green)
								}, 2000)
								async function CheckToken() {
									CheckToken = DataRead("token")
									if (!CheckToken || CheckToken == '') {
										ClientLoginErr("", "", "Токен порожній")
									} else {
										client.login(CheckToken).then(l => ClientLoginNOErr("")).catch(err => ClientLoginErr("", err))
									}
									async function ClientLoginNOErr(e) {
										logo(e)
										GoHelp(1)
										console.log("Токен працює! ".green)
										console.log("Цей токен належить: ".brightMagenta + client.user.tag.green)
										console.log("")
										console.log("Натисни ENTER щоб вийти!".yellow)

										exitt = await input('')

										MenuExit()
										return
									}
									async function ClientLoginErr(e, err, errr) {
										if (errr == undefined) {
											var errr = ''
										}
										logo(e)
										GoHelp(1)
										console.log("Помилка токену! ".red + errr.red)
										console.log("")
										console.log(err.message)
										console.log("")
										console.log("Натисни ENTER щоб вийти!".yellow)

										exitt = await input('')

										MenuExit()
										return
									}
								}
								break
							default:
								MenuExit()
								break
						}
					}
					// 4444444444
					break
				case 4:
					SomeElse(e)
					async function SomeElse(e, a) {
						logo(e, a)
						GoHelp(1)
						function AutoStatusON() {
							autostart = DataRead('autostart')
							if (autostart == "true") {
								return "[+]".green
							}
							if (autostart == "false") {
								return "[-]".red
							}
						}

						function HelpON() {
							help = DataRead('help')
							if (help == "true") {
								return "[+]".green
							}
							if (help == "false") {
								return "[-]".red
							}
						}

						function ChangeUPdateTIME() {
							UPdateTIME = DataRead('update_time')
							return UPdateTIME.green
						}

						function Lang() {
							lang = DataRead('lang')
							return lang.green
						}

						// 1111111111
						console.log("1".grey + " > ".brightCyan + "Ауто увімкнення статуса".brightMagenta + " - ".brightCyan + AutoStatusON())
						console.log("2".grey + " > ".brightCyan + "Підказки".brightMagenta + " - ".brightCyan + HelpON())
						console.log("3".grey + " > ".brightCyan + "Змінити UPDATE TIME".brightMagenta + " - ".brightCyan + ChangeUPdateTIME())
						console.log("4".grey + " > ".brightCyan + "Мова".brightMagenta + " BETA".grey + " - ".brightCyan + Lang())
						console.log("5".grey + " > ".brightCyan + "Видалити всі данні".brightMagenta)

						ElseInput = await input('')

						switch (parseInt(ElseInput)) {
							case 1:
								var autostart = DataRead("autostart")
								if (autostart == "true") {
									DataWrite("autostart", "false")
									SomeElse("", "Ауто увімкнення статуса змінено на ВИМК")
								}
								if (autostart == "false") {
									DataWrite("autostart", "true")
									SomeElse("", "Ауто увімкнення статуса змінено на УВІМК")
								}
								break
							case 2:
								var help = DataRead("help")
								if (help == "true") {
									DataWrite("help", "false")
									SomeElse("", "Значення підказки змінено на ВИМК")
								}
								if (help == "false") {
									DataWrite("help", "true")
									SomeElse("", "Значення підказки змінено на УВІМК")
								}
								break
							case 3:
								UPdateTIMEWaa(e)
								async function UPdateTIMEWaa(e) {
									logo(e)
									GoHelp(1)
									console.log(">".brightCyan + " - ".grey + "UPDATE TIME Це чяс через який программа буде 'поновлювати' статус.".brightMagenta)
									console.log(">".brightCyan + " Ставити нище чім 12000 нерекомундую! Зараз: ".brightMagenta + ChangeUPdateTIME())

									UPdateTIMEWaaInput = await input('')

									if (UPdateTIMEWaaInput == "9" || UPdateTIMEWaaInput.length < 1) {
										SomeElse(e)
										return
									} else {
										if (parseInt(UPdateTIMEWaaInput) + 0 == UPdateTIMEWaaInput) {
											DataWrite("update_time", UPdateTIMEWaaInput)
											Menu("", `UPDATE TIME тепер ` + UPdateTIMEWaaInput)
										} else {
											console.log("")
											console.log("Тільки ЦИФРИ!".red)

											exitt = await input('')

											UPdateTIMEWaa()
											return
										}
									}
								}
								break
							case 4:
								LangWaa(e)
								async function LangWaa(e) {
									logo(e)
									GoHelp(1)
									console.log(">".brightCyan + " - ".grey + "Мова программи покищо BETA.".brightMagenta)
									console.log("| ".grey + "1".brightCyan + " - ".grey + "Українська 99%".green)
									console.log("| ".grey + "2".brightCyan + " - ".grey + "Русский 95%".green)

									UPdateTIMEWaaInput = await input('')

									if (UPdateTIMEWaaInput == "9" || UPdateTIMEWaaInput.length < 1) {
										SomeElse(e)
										return
									} else {
										// зделать языки
									}
								}
								break
							case 5:
								DellAllData(e)
								async function DellAllData(e) {
									logo(e)
									GoHelp(1)
									console.log(">".brightCyan + " - ".grey + "Видалити всі данні або збити программу на заводскі налаштування.".brightMagenta)
									console.log(">".brightCyan + " - ".grey + "Ви реально хочете видалити данні? Такі як: ВСІ тексти, токени, та інші налаштування.".red)
									console.log("| ".grey + "1".brightCyan + " - ".grey + "ТАК".red)
									console.log("| ".grey + "2".brightCyan + " - ".grey + "НІ".green)

									UPdateTIMEWaaInput = await input('')

									if (UPdateTIMEWaaInput == "9" || UPdateTIMEWaaInput.length < 1) {
										SomeElse(e)
										return
									} else if (UPdateTIMEWaaInput == "1") {
										DataWrite("autostart", "false")
										DataWrite("help", "true")
										DataWrite("new", "1")
										DataWrite("bufer", "false")
										DataWrite("lang", "ua")
										DataWrite("cashe", "0;0;0;0")
										DataWrite("text1", "Приветствую пользователя с телефона :D;Калькулятор by MaKarastY#6177;Микроволновке;електро чайнике")
										DataWrite("text2", "Вечный стриам;Вечный стриам;Вечный стриам;Вечный стриам")
										DataWrite("text3", "описани можно делать вооооопще любое;их можна делать много;очень много статусов;онимация")
										DataWrite("token", "")
										DataWrite("twitch", "https://www.twitch.tv/makarasty")
										DataWrite("type", "STREAMING")
										DataWrite("update_time", "40000")
										console.log("")
										console.log("Данні видалено :c".red)
										console.log("")
										console.log("Натисни ENTER щоб вийти!".yellow)
										exitt = await input('')
										NewUser()
										return
									} else {
										SomeElse(e)
										return
									}
								}
								break
							default:
								MenuExit()
								break
						}
					}
					break
				case 5:
					waittostatus()
					break
				case 6:
					process.exit()
					break
				default:
					Menu("e")
					break
			}
		}
		async function UserCanStopStatus() {
			console.log("")
			console.log("Натиснення ENTER вимкне статус, та перекине вас в головне меню!".gray)

			UserInput = await input('')

			console.log("Статус буде вимкнено через 5 сек!".yellow)
			console.log("ДС нелюбить багато запитів к API тому чекаємо :c".yellow)

			clearTimeout(ClientProgramRestart)

			ClientInputExit = setTimeout(() => {
				Menu("", `Статус вимкнено, ти в меню!`)
			}, 4000)
		}
		async function ClientLoginNOErr() {
			logo()
			GoHelp(1)
			const twitch = DataRead("twitch"),
				type = DataRead("type").split(';'),
				text = DataRead("text1").split(';'),
				subtext = DataRead("text2").split(';'),
				endtext = DataRead("text3").split(';'),
				update_time = DataRead("update_time"),
				token = DataRead("token")

			// Кеш
			let lastreadcashe = DataRead("cashe").split(';')
			if (parseInt(lastreadcashe[0]) > type.length - 1) {
				var typ = 1
			} else {
				var typ = parseInt(lastreadcashe[0]) + 1
			}
			if (parseInt(lastreadcashe[1]) > text.length - 1) {
				var tex = 1
			} else {
				var tex = parseInt(lastreadcashe[1]) + 1
			}
			if (parseInt(lastreadcashe[2]) > subtext.length - 1) {
				var sub = 1
			} else {
				var sub = parseInt(lastreadcashe[2]) + 1
			}
			if (parseInt(lastreadcashe[3]) > endtext.length - 1) {
				var end = 1
			} else {
				var end = parseInt(lastreadcashe[3]) + 1
			}
			DataWrite("cashe", typ + ";" + tex + ';' + sub + ';' + end)

			console.log("| ".cyan + DataRead("cashe").gray)
			console.log('')
			// PLAYING STREAMING LISTENING WATCHING
			switch (type[0]) {
				case "PLAYING":
					console.log("| ".cyan + "Играет в ".gray + text[tex - 1].yellow)
					console.log('')
					console.log("| ".cyan + text[tex - 1].yellow)
					console.log("| ".cyan + subtext[sub - 1].yellow)
					console.log("| ".cyan + endtext[end - 1].yellow)
					break;
				case "STREAMING":
					console.log("| ".cyan + "Стримит ".gray + subtext[sub - 1].yellow)
					console.log('')
					console.log("| ".cyan + "СТРИМИТ НА ".gray + text[tex - 1].yellow)
					console.log("| ".cyan + subtext[sub - 1].yellow)
					console.log("| ".cyan + "Играет в ".gray + endtext[end - 1].yellow)
					break;
				case "LISTENING":
					console.log("| ".cyan + "Cлушает ".gray + text[tex - 1].yellow)
					console.log('')
					console.log("| ".cyan + "CЛУШАЕТ ".gray + text[tex - 1].yellow)
					console.log("| ".cyan + subtext[sub - 1].yellow)
					console.log("| ".cyan + endtext[end - 1].yellow)
					break;
				case "WATCHING":
					console.log("| ".cyan + "Смотрит ".gray + text[tex - 1].yellow)
					console.log('')
					console.log("| ".cyan + "СМОТРИТ ".gray + text[tex - 1].yellow)
					console.log("| ".cyan + subtext[sub - 1].yellow)
					console.log("| ".cyan + endtext[end - 1].yellow)
					break;
			}

			ClientProgramRestart = null
			ClientProgramRestart = setTimeout(() => {
				ClientUpdateExit("Stop")
			}, parseInt(update_time))

			client.on("ready", () => {
				client.login(token)
				UserCanStopStatus()
				console.log("")
				console.log("Ауторизований як ".yellow + client.user.tag.green)
				client.user.setPresence({
					game: {
						name: text[tex - 1],
						type: type[typ - 1],
						url: twitch,
						details: subtext[sub - 1],
						state: endtext[end - 1],
					}
				})
			})
			client.login(token)
		}
	}
}
/* */ 