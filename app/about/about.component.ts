import { Component, OnInit, Inject} from '@angular/core';
import { LeaderService } from '~/services/leader.service';
import { Leader } from '~/shared/leader';
import { baseURL } from '~/shared/baseurl';
import * as app from "application";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";


@Component({
  selector: 'app-about',
  moduleId: module.id,
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
    leaders: Leader[];
    errMess : string;
    constructor( @Inject('baseURL') private baseURL,private leaderService:LeaderService){

    }
    ngOnInit(){
        this.leaderService.getLeaders().subscribe(leaders=> this.leaders = leaders,
            errmess => this.errMess = <any>errmess);
    }
    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
    }
}