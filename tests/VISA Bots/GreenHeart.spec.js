require('dotenv').config()

const { test } = require('@playwright/test');
test("hubspot login", async ({ browser }) => {
  const context = await browser.newContext({
    storageState: "./auth.json"
  })

  //opens HubSpot
  const page = await context.newPage();
  await page.goto("https://www.hubspot.com/");
  await page.waitForTimeout(3000);
  
  //close cookies
  await page.getByRole('button', { name: 'Allow cookies' }).click();
  await page.getByRole('link', { name: 'Go to my account' }).click();
  
  //scrap data
  await page.goto("https://app.hubspot.com/contacts/4209490/lists/21403/filters");
  const candidateData = await page.locator('//*[@id="crm"]/div[3]/div[1]/div/div/div/div/div/div/section/div/div/main/div/div/div[2]/div/div/div/div[1]/div/div[1]/table/tbody/tr/td[2]/div/a/span/span').textContent();
  const newCandidateData = candidateData.split(" ");
  const candidateName = newCandidateData[0];
  const candidateLastName = newCandidateData[1];
  const candidateEmail = await page.locator('//*[@id="crm"]/div[3]/div[1]/div/div/div/div/div/div/section/div/div/main/div/div/div[2]/div/div/div/div[1]/div/div[1]/table/tbody/tr/td[3]/a').textContent();
  const skypeID = await page.locator('//*[@id="crm"]/div[3]/div[1]/div/div/div/div/div/div/section/div/div/main/div/div/div[2]/div/div/div/div[1]/div/div[1]/table/tbody/tr/td[4]/span').textContent();
  const programOption = await page.locator('//*[@id="crm"]/div[3]/div[1]/div/div/div/div/div/div/section/div/div/main/div/div/div[2]/div/div/div/div[1]/div/div[1]/table/tbody/tr/td[5]/span').textContent();
  
  await page.locator('//*[@id="crm"]/div[3]/div[1]/div/div/div/div/div/div/section/div/div/main/div/div/div[2]/div/div/div/div[1]/div/div[1]/table/tbody/tr/td[2]/div/a/span/span').click();
  const programDate = await page.getByLabel('Program Start Date (visa)').inputValue();
  
  console.log(
    `CANDIDATE INFO:
              Candidate Name: ${candidateName}\n 
              Candidate Last Name: ${candidateLastName}\n 
              Candidate Email: ${candidateEmail}\n 
              SkypeID: ${skypeID}\n
              Program Option: ${programOption}\n
              Program Date: ${programDate}
              `
  )

  await page.goto("https://geo.greenheart.org/General/applogin.aspx");
  await page.getByLabel('User Name:').click();
  await page.getByLabel('User Name:').fill(`${process.env.GREENHEART_USERNAME}`);
  await page.getByLabel('Password:').click();
  await page.getByLabel('Password:').fill(`${process.env.GREENHEART_PASSWORD}`);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.locator('#ctl00_navMenu').getByRole('link', { name: 'Participants' }).click();
  await page.getByRole('link', { name: 'Create New Participant' }).click();
  await page.getByRole('combobox', { name: 'Step 1. Select which program you wish to add participants to.' }).selectOption('12');
  await page.getByRole('combobox', { name: 'Step 2. Select which season you wish to add participants to. Step 4. Enter Participants Information.' }).selectOption('4083');
  await page.getByLabel('Manually You will need to enter the information for each participant one at a time.').check();
  await page.locator('#ctl00_Body_ucPartnerParticipant_dgParticipant_ctl03_FirstName').click();
  await page.locator('#ctl00_Body_ucPartnerParticipant_dgParticipant_ctl03_FirstName').fill(`${candidateName}`);
  await page.locator('#ctl00_Body_ucPartnerParticipant_dgParticipant_ctl03_LastName').click();
  await page.locator('#ctl00_Body_ucPartnerParticipant_dgParticipant_ctl03_LastName').fill(`${candidateLastName}`);
  await page.locator('#ctl00_Body_ucPartnerParticipant_dgParticipant_ctl03_Email').click();
  await page.locator('#ctl00_Body_ucPartnerParticipant_dgParticipant_ctl03_Email').fill(`${candidateEmail}`);
  await page.locator('#ctl00_Body_ucPartnerParticipant_dgParticipant_ctl03_SkypeUsername').click();
  await page.locator('#ctl00_Body_ucPartnerParticipant_dgParticipant_ctl03_SkypeUsername').fill(`${skypeID}`);
  if (programOption.includes('Trainee')){
    await page.locator('#ctl00_Body_ucPartnerParticipant_dgParticipant_ctl03_ProgramOptionID').selectOption('15');
  } else {
    await page.locator('#ctl00_Body_ucPartnerParticipant_dgParticipant_ctl03_ProgramOptionID').selectOption('10');
  }
  await page.locator('#ctl00_Body_ucPartnerParticipant_dgParticipant_ctl03_ucDateChooser_Date').click();
  await page.locator('#ctl00_Body_ucPartnerParticipant_dgParticipant_ctl03_ucDateChooser_Date').fill(`${programDate}`);
  //await page.screenshot({ path: 'screenshot.png' });
  //await page.getByRole('button', { name: 'Add Participants' }).click();
  
  //aditional exchange info
  const page1 = await context.newPage();
  await page1.goto('https://geo.greenheart.org/partners/Participants/Default.aspx');
  await page1.locator('#ctl00_ucParticipantSearch_ddlParticipantSearch').selectOption('Email');
  await page1.locator('#ctl00_ucParticipantSearch_jsSearchString').click();
  await page1.locator('#ctl00_ucParticipantSearch_jsSearchString').fill(`${candidateEmail}`);
  await page1.getByRole('button', { name: 'Go' }).click();
  await page1.locator('//*[@id="ctl00_Body_dgParticipant"]/tbody/tr[2]/td[3]').click();
  
  const page2Promise = page1.waitForEvent('popup');
  const page2 = await page2Promise;
  
  //section one
  if (programOption.includes('Trainee')){
    await page2.getByRole('combobox', { name: 'Program Category:' }).selectOption('2'); //trainee
  } else {
    await page2.getByRole('combobox', { name: 'Program Category:' }).selectOption('3'); // intern
  } 
  await page2.getByRole('combobox', { name: 'Occupational Category:' }).selectOption('4'); //hospitality
  
  await page2.getByLabel('Current Field of Study/Profession:').click();
  await page2.getByLabel('Current Field of Study/Profession:').fill('Study');
  await page2.getByLabel('Experience in Field (number of years):').click();
  await page2.getByLabel('Experience in Field (number of years):').fill('1');
  await page2.getByLabel('Type of Degree or Certificate:').click();
  await page2.getByLabel('Type of Degree or Certificate:').fill('Degree');
  await page2.locator('#ctl00_ContentPlaceHolder1_pnlTIPPInfo_DateAwardedOrExpected_Date').click();
  await page2.locator('#ctl00_ContentPlaceHolder1_pnlTIPPInfo_DateAwardedOrExpected_Date').fill('12/04/2021');
  await page2.locator('#ctl00_ContentPlaceHolder1_pnlTIPPInfo_TrainingStartDate_Date').click();
  await page2.locator('#ctl00_ContentPlaceHolder1_pnlTIPPInfo_TrainingStartDate_Date').fill('6/05/2023');
  await page2.locator('#ctl00_ContentPlaceHolder1_pnlTIPPInfo_TrainingEndDate_Date').click();
  await page2.locator('#ctl00_ContentPlaceHolder1_pnlTIPPInfo_TrainingEndDate_Date').fill('6/06/2024');
  await page2.locator('#ctl00_ContentPlaceHolder1_btnNextBottom').click();

  //section two

  await page2.getByLabel('Address:').click();
  await page2.getByLabel('Address:').press('CapsLock');
  await page2.getByLabel('Address:').fill('Adress');
  await page2.getByRole('row', { name: '* Address:', exact: true }).getByRole('cell').nth(2).click();
  await page2.getByLabel('City :').click()
  await page2.getByLabel('City :').fill('City');
  await page2.getByRole('combobox', { name: 'State:' }).selectOption('1');
  await page2.getByLabel('Zip Code:').click();
  await page2.getByLabel('Zip Code:').fill('646474');
  await page2.getByRole('row', { name: '* City :', exact: true }).getByRole('cell').nth(2).click();
  await page2.getByLabel('Website URL:').click();
  await page2.getByLabel('Website URL:').fill('kesslercollection.com');
  await page2.getByLabel('Employer ID Number (EIN):').click();
  await page2.getByLabel('Employer ID Number (EIN):').fill('49-3470873');
  await page2.locator('#ctl00_ContentPlaceHolder1_pnlTIPPInfo_StipendAmount').fill('23');
  await page2.locator('#ctl00_ContentPlaceHolder1_pnlTIPPInfo_StipendAmount').click();
  await page2.locator('#ctl00_ContentPlaceHolder1_pnlTIPPInfo_StipendFrequency').selectOption('Item01');
  await page2.getByRole('row', { name: '* Will the participant receive other compensation? Yes No', exact: true }).getByLabel('Yes').check();
  await page2.locator('#ctl00_ContentPlaceHolder1_pnlTIPPInfo_NonMonetaryAmount').fill('2');
  await page2.locator('#ctl00_ContentPlaceHolder1_pnlTIPPInfo_NonMonetaryAmount').click();
  await page2.locator('#ctl00_ContentPlaceHolder1_pnlTIPPInfo_NonMonetaryAmount').fill('22');
  await page2.locator('#ctl00_ContentPlaceHolder1_pnlTIPPInfo_NonMonetaryFrequency').selectOption('Item01');
  await page2.getByRole('row', { name: 'Does the organization have a Workers\' Compensation policy? Yes No', exact: true }).getByLabel('No').check();
  await page2.getByLabel('Number of Full-Time Employees Onsite at Location:').click();
  await page2.getByLabel('Number of Full-Time Employees Onsite at Location:').fill('140');
  await page2.getByLabel('$25 Million or More').check();

  //section three

  
  await page2.getByLabel('Main Program Supervisor/POC at Host Organization:').click();
  await page2.getByLabel('Main Program Supervisor/POC at Host Organization:').press('CapsLock');
  await page2.getByLabel('Main Program Supervisor/POC at Host Organization:').fill('Main ');
  await page2.getByLabel('Main Program Supervisor/POC at Host Organization:').press('CapsLock');
  await page2.getByLabel('Main Program Supervisor/POC at Host Organization:').fill('Main Program ');
  await page2.getByLabel('Main Program Supervisor/POC at Host Organization:').press('CapsLock');
  await page2.getByLabel('Main Program Supervisor/POC at Host Organization:').fill('Main Program Super');
  await page2.getByLabel('Main Program Supervisor\'s Title:').click();
  await page2.getByLabel('Main Program Supervisor\'s Title:').press('CapsLock');
  await page2.getByLabel('Main Program Supervisor\'s Title:').fill('Supervisor ');
  await page2.getByLabel('Main Program Supervisor\'s Title:').press('CapsLock');
  await page2.getByLabel('Main Program Supervisor\'s Title:').fill('Supervisor Title');
  await page2.getByLabel('Supervisor\'s Email:').click();
  await page2.getByLabel('Supervisor\'s Email:').fill('email@email.com');
  await page2.getByLabel('Training/Internship field:').click();
  await page2.getByLabel('Training/Internship field:').fill('testing field');
  await page2.locator('#ctl00_ContentPlaceHolder1_btnNextBottom').click();

  //Phase Information

  await page2.getByText('« Previous Changes will be saved when Next is clicked.').first().click();

  await page2.getByLabel('Phase Site Name:').click();
  await page2.getByLabel('Phase Site Name:').fill('phase site');
  await page2.getByLabel('Phase Site Address:').fill('a');
  await page2.getByLabel('Phase Site Address:').click();
  await page2.getByLabel('Phase Site Address:').fill('address');
  await page2.locator('#ctl00_ContentPlaceHolder1_PhaseStartDate_Date').click();
  await page2.locator('#ctl00_ContentPlaceHolder1_PhaseStartDate_Date').fill('09/8/23');
  await page2.getByLabel('Primary Phase Supervisor:').click();
  await page2.getByLabel('Primary Phase Supervisor:').fill('supervisor');
  await page2.getByLabel('Phase Name:').click();
  await page2.getByLabel('Phase Name:').fill('phase name');
  await page2.locator('#ctl00_ContentPlaceHolder1_PhaseEndDate_Date').click();
  await page2.locator('#ctl00_ContentPlaceHolder1_PhaseEndDate_Date').fill('04/95/24');
  await page2.getByLabel('Supervisor Title:').click();
  await page2.getByLabel('Supervisor Title:').fill('super title');
  await page2.getByLabel('Email:').click();
  await page2.getByLabel('Email:').fill('email');
  await page2.getByLabel('Phone Number:').click();
  await page2.getByLabel('Phone Number:').fill('phone number');
  await page2.getByLabel('Description of Trainee/Intern\'s role for this program or phase').click();
  await page2.getByLabel('Description of Trainee/Intern\'s role for this program or phase').fill('description of the role');
  await page2.getByLabel('Specific goals and objectives for this program or phase').click();
  await page2.getByLabel('Specific goals and objectives for this program or phase').fill('objectives for the phase');
  await page2.getByRole('cell', { name: '* Description of Trainee/Intern\'s role for this program or phase', exact: true }).click();
  await page2.getByRole('cell', { name: '* Specific goals and objectives for this program or phase', exact: true }).click();
  await page2.getByLabel('Please list the names and titles of those who will provide continuous (for example, daily) supervision of the Trainee/Intern, including the primary\nsupervisor. What are these persons\' qualifications to teach the planned learning?').click();
  await page2.getByLabel('Please list the names and titles of those who will provide continuous (for example, daily) supervision of the Trainee/Intern, including the primary\nsupervisor. What are these persons\' qualifications to teach the planned learning?').fill('list names and titles');
  await page2.getByLabel('What plans are in place for the Trainee/Intern to participate in cultural activities while in the United States?').click();
  await page2.getByLabel('What plans are in place for the Trainee/Intern to participate in cultural activities while in the United States?').fill('cultural activities');
  await page2.getByLabel('What specific knowledge, skills, or techniques will be learned?').click();
  await page2.getByLabel('What specific knowledge, skills, or techniques will be learned?').fill('skills techniques');
  await page2.getByLabel('How specifically will these knowledge, skills, or techniques be taught? Include specific tasks and activities (Interns) and/ or methodology of training\nand chronology/syllabus (Trainees).').click();
  await page2.getByLabel('How specifically will these knowledge, skills, or techniques be taught? Include specific tasks and activities (Interns) and/ or methodology of training\nand chronology/syllabus (Trainees).').fill('taught way');
  await page2.getByLabel('How will the Trainee/Intern\'s acquisition of new skills and competencies be measured?').click();
  await page2.getByLabel('How will the Trainee/Intern\'s acquisition of new skills and competencies be measured?').fill('measured');
  //await page2.getByLabel('Additional Phase Remarks (optional)').click();
  //await page2.getByLabel('Additional Phase Remarks (optional)').fill('additional remarks');
  //await page2.getByRole('button', { name: 'Save' }).click();

  console.log("Process Completed ✨")
});