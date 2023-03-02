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
  await page.getByRole('link', { name: 'Go to my account' }).click();
  await page.goto('https://app.hubspot.com/contacts/4209490/lists/21338/filters');

  //close warning notification
  await page.getByRole('button', { name: 'Close' }).click();
  
  //scrap data
  const candidateName = await page.locator('//*[@id="crm"]/div[3]/div[1]/div/div/div/div/div/div/section/div/div/main/div/div/div[2]/div/div/div/div[1]/div/div[1]/table/tbody/tr[1]/td[2]/div/a/span/span').textContent();
  const candidateEmail = await page.locator('//*[@id="crm"]/div[3]/div[1]/div/div/div/div/div/div/section/div/div/main/div/div/div[2]/div/div/div/div[1]/div/div[1]/table/tbody/tr[1]/td[3]/a').textContent();

  console.log(
    `CANDIDATE INFO:
              Candidate Name: ${candidateName}\n 
              Candidate Email: ${candidateEmail}\n
              `
  )
  
  //makes sure email is in lowercase and that the visa Specialist is active
  const sanitizedCandidateMail = candidateEmail?.toLowerCase();

  //open PandaDoc to login
  await page.getByRole('link', {name:`${candidateName}`}).click();
  const page1 = await context.newPage();
  await page1.goto('https://www.pandadoc.com/');
  await page1.getByRole('link', { name: 'Log in' }).click();
  await page1.locator('#email').click();
  await page1.locator('#email').fill('visa@placement-int.com');
  await page1.locator('#password').click();
  await page1.locator('#password').fill('');
  await page1.locator('#password').fill(`${process.env.PANDADOC_PASSWORD}`);
  await page1.getByRole('button', { name: 'Log in' }).click();
  console.log("Succesfully log into PandaDoc 🥳")
  await page1.waitForTimeout(5000);
  await page1.close();
  
  //Go back to HubSpot to create the new document
  await page.getByRole('button', { name: 'Create Document' }).click();
  await page.waitForTimeout(5000);
  await page.frameLocator('internal:role=dialog >> iframe').getByRole('button', { name: 'Accept All Cookies' }).click();
  await page.waitForTimeout(5000);
  await page.frameLocator('internal:role=dialog >> iframe').getByRole('dialog').locator('div').filter({ hasText: 'New Document' }).getByRole('button').click();
  await page.waitForTimeout(3000);
  await page.frameLocator('internal:role=dialog >> iframe').getByPlaceholder('Search').fill('Greenheart Cap+2023');
  await page.waitForTimeout(3000);
  await page.frameLocator('internal:role=dialog >> iframe').locator('a').filter({ hasText: 'Greenheart Cap+2023 Resume' }).click();
  await page.waitForTimeout(5000);
  
  //adding data to create the doc
  await page.frameLocator('internal:role=dialog >> iframe').getByPlaceholder('Start typing name or email').first().fill(`${sanitizedCandidateMail}`);
  await page.frameLocator('internal:role=dialog >> iframe').getByText(`${sanitizedCandidateMail}`, { exact: true }).click();
  await page.waitForTimeout(3000);
  const page1Promise = page.waitForEvent('popup');
  await page.frameLocator('internal:role=dialog >> iframe').getByRole('button', { name: 'Start editing' }).click();
  const page2 = await page1Promise;
  await page2.frameLocator('#kolas-editor-iframe').getByRole('button', { name: 'Send' }).click();
  await page2.frameLocator('#kolas-editor-iframe').getByText('Send via email').click();
  await page.waitForTimeout(5000);

  //writing email
  await page2.frameLocator('#kolas-editor-iframe').getByTestId('documentNameInput').fill(`Greenheart CAP + Resume ${candidateName}`);
  await page2.frameLocator('#kolas-editor-iframe').getByRole('button', { name: 'Save and continue' }).click();
  await page2.frameLocator('#kolas-editor-iframe').getByPlaceholder('Optional message...').click();
  await page2.frameLocator('#kolas-editor-iframe').getByPlaceholder('Optional message...').fill(`
  Dear ${candidateName},\n\nI hope you are doing great!\n\nKindly find the Greenheart CAP Resume Form below. 
  Please use this document to complete your personal information, as well as justify any gap in your CV with
  with your occupation at that time. Make sure all the information is relevant and up-to-date.\n
  \nThis is an automatic email! 
  Please contact your visa specialist in case you have any in case you have any questions regarding the Greenheart CAP Resume document. Best regards!`);
  await page2.waitForTimeout(3000);
  //await page2.frameLocator('#kolas-editor-iframe').getByRole('button', { name: 'Send document' }).click();
  console.log("Document succesfully sent! ")
  await page2.waitForTimeout(3000);
  await page2.close();

  //update candidate on CRM
  await page.getByRole('link', { name: 'View all properties' }).click();
  await page.getByPlaceholder('Search properties').click();
  await page.getByPlaceholder('Search properties').fill('test CAP Resume Bot');
  await page.getByText('test CAP Resume Bot').click();
  await page.getByLabel('test CAP Resume Bot').fill('Yes');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(3000);
  console.log("Candidate succesfully removed from the list!")
  
  await page.goto('https://app.hubspot.com/contacts/4209490/lists/21338/filters');
  console.log("Process Completed ✨")
});