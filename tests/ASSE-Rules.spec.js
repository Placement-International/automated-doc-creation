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
  await page.goto('https://app.hubspot.com/contacts/4209490/lists/21368/filters');


  //close warning notification
  //await page.getByRole('button', { name: 'Close' }).click();
  
  //scrap data
  const candidateName = await page.locator('//*[@id="crm"]/div[3]/div[1]/div/div/div/div/div/div/section/div/div/main/div/div/div[2]/div/div/div/div[1]/div/div[1]/table/tbody/tr[1]/td[2]/div/a/span/span').textContent();
  const candidateEmail = await page.locator('//*[@id="crm"]/div[3]/div[1]/div/div/div/div/div/div/section/div/div/main/div/div/div[2]/div/div/div/div[1]/div/div[1]/table/tbody/tr[1]/td[3]/a').textContent();
  const visaName = await page.locator('//*[@id="crm"]/div[3]/div[1]/div/div/div/div/div/div/section/div/div/main/div/div/div[2]/div/div/div/div[1]/div/div[1]/table/tbody/tr/td[4]/span').textContent();
  const visaEmail = 'visa@placement-int.com'

  console.log(
    `CANDIDATE INFO:
              Candidate Name: ${candidateName}\n 
              Candidate Email: ${candidateEmail}\n 
              Visa Specialist Name: ${visaName}\n
              Visa Specialist Email: ${visaEmail}\n
              `
  )
  
  //makes sure email is in lowercase and that the visa Specialist is active
  const sanitizedCandidateMail = candidateEmail?.toLowerCase();
  if (visaName?.includes('Deactivated/Removed User')) {
    return console.log('Visa Specialist Deactivated/Removed, cannot continue the process')
  }

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
  await page.frameLocator('internal:role=dialog >> iframe').getByPlaceholder('Search').fill('Asse Rules');
  await page.waitForTimeout(3000);
  await page.frameLocator('internal:role=dialog >> iframe').locator('a').filter({ hasText: 'Asse Rules' }).click();
  await page.waitForTimeout(5000);
  
  //adding data to create the doc
  await page.frameLocator('internal:role=dialog >> iframe').getByPlaceholder('Start typing name or email').first().fill(`${sanitizedCandidateMail}`);
  await page.frameLocator('internal:role=dialog >> iframe').getByText(`${sanitizedCandidateMail}`, { exact: true }).click();
  await page.waitForTimeout(3000);
  await page.frameLocator('internal:role=dialog >> iframe').getByPlaceholder('Start typing name or email').first().fill(`${visaEmail}`);
  await page.frameLocator('internal:role=dialog >> iframe').getByText(`Add ${visaEmail}`).click();
  await page.frameLocator('internal:role=dialog >> iframe').getByRole('button', { name: 'Add person' }).click();
  await page.waitForTimeout(3000);
  const page1Promise = page.waitForEvent('popup');
  await page.frameLocator('internal:role=dialog >> iframe').getByRole('button', { name: 'Start editing' }).click();
  const page2 = await page1Promise;
  await page2.frameLocator('#kolas-editor-iframe').getByRole('button', { name: 'Send' }).click();
  await page2.frameLocator('#kolas-editor-iframe').getByText('Send via email').click();
  await page.waitForTimeout(5000);

  //writing email
  await page2.frameLocator('#kolas-editor-iframe').getByTestId('documentNameInput').fill(`ASSE Rules and Regulation of ${candidateName} (sent by ${visaName})`);
  await page2.frameLocator('#kolas-editor-iframe').getByRole('button', { name: 'Save and continue' }).click();
  await page2.frameLocator('#kolas-editor-iframe').getByPlaceholder('Optional message...').click();
  await page2.frameLocator('#kolas-editor-iframe').getByPlaceholder('Optional message...').fill(`
    Dear ${candidateName},\n 
    I hope you are doing great!\n 
    Kindly find the ASSE Rules and Regulations document below.\n Please use this document to complete with your initials (must match all the names in the passport) on the first and second page. Write one initial (letter) per name in your passport e.g. Anna May Smith= AMS. Kindly make sure to sign it on the second page and click Finish when the document is completed.\n 
    This is an automatic email!\n 
    Please contact ${visaName} in case you have any questions regarding the ASSE Rules and Regulations document. Best regards!`);
  await page2.waitForTimeout(3000);
  //await page2.frameLocator('#kolas-editor-iframe').getByRole('button', { name: 'Send document' }).click();
  console.log("Document succesfully sent! ")
  await page2.waitForTimeout(3000);
  await page2.close();
  
  //update candidate on CRM
  await page.getByRole('link', { name: 'View all properties' }).click();
  await page.getByPlaceholder('Search properties').click();
  await page.getByPlaceholder('Search properties').fill('Asse Rules and');
  await page.getByText('test Asse Rules and Regulations Bot').click();
  await page.getByLabel('test Asse Rules and Regulations Bot').fill('Yes');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(3000);
  console.log("Candidate succesfully removed from the list!")
  await page.goto('https://app.hubspot.com/contacts/4209490/lists/21368/filters');
  console.log("Process Completed ✨")
});